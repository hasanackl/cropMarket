using CropMarket.Application.Common.Interfaces;
using CropMarket.Application.Features.Orders.Dtos;
using CropMarket.Application.Features.Orders.Requests;
using CropMarket.Application.Features.Orders.Results;
using CropMarket.Domain.Entities;
using CropMarket.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace CropMarket.Application.Features.Orders;

public class OrderService : IOrderService
{
    private readonly IAppDbContext _context;

    public OrderService(IAppDbContext context)
    {
        _context = context;
    }

    // FR-04, FR-05, NFR-02
    public async Task<CreateOrderResult> CreateAsync(int consumerId, CreateOrderRequest request)
    {
        var listing = await _context.Listings
            .FirstOrDefaultAsync(l => l.Id == request.ListingId && l.IsActive);

        if (listing is null)
        {
            return CreateOrderResult.Failure(CreateOrderError.ListingNotFound,
                "The listing was not found or is no longer active.");
        }

        if (request.Quantity <= 0)
        {
            return CreateOrderResult.Failure(CreateOrderError.InvalidQuantity,
                "Quantity must be greater than zero.");
        }

        // Pieces and boxes cannot be split; only kilograms may have decimals
        if (listing.Unit != Unit.Kg && request.Quantity != decimal.Floor(request.Quantity))
        {
            return CreateOrderResult.Failure(CreateOrderError.InvalidQuantity,
                $"Quantity must be a whole number for unit {listing.Unit}.");
        }

        if (request.Quantity > listing.AvailableQuantity)
        {
            return CreateOrderResult.Failure(CreateOrderError.InsufficientStock,
                $"Requested {request.Quantity:0.##} {listing.Unit} but only {listing.AvailableQuantity:0.##} {listing.Unit} is available.");
        }

        var order = new Order
        {
            ListingId = listing.Id,
            ConsumerId = consumerId,
            Quantity = request.Quantity,
            UnitPriceAtOrder = listing.UnitPrice,
            TotalPrice = decimal.Round(request.Quantity * listing.UnitPrice, 2),
            DeliveryAddress = request.DeliveryAddress.Trim()
        };

        // FR-05: reduce the stock; a sold-out listing is hidden from the search
        listing.AvailableQuantity -= request.Quantity;
        if (listing.AvailableQuantity == 0)
        {
            listing.IsActive = false;
        }

        _context.Orders.Add(order);

        // One SaveChanges = one database transaction: the order is inserted and the stock is
        // updated together, or neither happens. RowVersion makes the UPDATE fail if another
        // order changed the same listing after we read it (ADR-02).
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            return CreateOrderResult.Failure(CreateOrderError.StockChanged,
                "The stock of this listing was changed by another order. Please refresh and try again.");
        }

        return CreateOrderResult.Success(ToDto(order, listing));
    }

    // Stage 3: the consumer's own orders, newest first
    public async Task<List<MyOrderDto>> GetMineAsync(int consumerId)
    {
        return await _context.Orders
            .Where(o => o.ConsumerId == consumerId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new MyOrderDto(
                o.Id,
                o.ListingId,
                o.Listing.ProductName,
                o.Listing.Category,
                o.Listing.Farmer.FullName,
                o.Quantity,
                o.Listing.Unit,
                o.TotalPrice,
                o.PaymentMethod,
                o.Status,
                o.DeliveryAddress,
                o.CreatedAt))
            .ToListAsync();
    }

    // FR-06: only the orders placed on this farmer's listings
    public async Task<List<ReceivedOrderDto>> GetReceivedAsync(int farmerId)
    {
        return await _context.Orders
            .Where(o => o.Listing.FarmerId == farmerId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(ToReceivedDto)
            .ToListAsync();
    }

    // FR-06: Pending -> Preparing -> Delivered, only forward
    public async Task<UpdateOrderStatusResult> UpdateStatusAsync(int farmerId, int orderId, UpdateOrderStatusRequest request)
    {
        var order = await _context.Orders
            .Include(o => o.Listing)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order is null)
        {
            return UpdateOrderStatusResult.Failure(UpdateOrderStatusError.OrderNotFound,
                "The order was not found.");
        }

        // NFR-03: a farmer can only change orders on their own listings
        if (order.Listing.FarmerId != farmerId)
        {
            return UpdateOrderStatusResult.Failure(UpdateOrderStatusError.NotYourOrder,
                "You can only change the status of orders placed on your own listings.");
        }

        var newStatus = request.Status!.Value;

        // The enum values are ordered (Pending = 0, Preparing = 1, Delivered = 2),
        // so "forward" simply means a bigger value
        if (newStatus <= order.Status)
        {
            return UpdateOrderStatusResult.Failure(UpdateOrderStatusError.InvalidTransition,
                $"The status can only move forward (Pending, Preparing, Delivered). This order is already {order.Status}.");
        }

        order.Status = newStatus;
        await _context.SaveChangesAsync();

        var updated = await _context.Orders
            .Where(o => o.Id == order.Id)
            .Select(ToReceivedDto)
            .FirstAsync();

        return UpdateOrderStatusResult.Success(updated);
    }

    private static readonly Expression<Func<Order, ReceivedOrderDto>> ToReceivedDto = o => new ReceivedOrderDto(
        o.Id,
        o.ListingId,
        o.Listing.ProductName,
        o.Listing.Category,
        o.Consumer.FullName,
        o.Consumer.PhoneNumber,
        o.Quantity,
        o.Listing.Unit,
        o.TotalPrice,
        o.Status,
        o.DeliveryAddress,
        o.CreatedAt);


    private static OrderDto ToDto(Order order, Listing listing) => new(
        order.Id,
        listing.Id,
        listing.ProductName,
        order.Quantity,
        listing.Unit,
        order.UnitPriceAtOrder,
        order.TotalPrice,
        order.PaymentMethod,
        order.Status,
        order.DeliveryAddress,
        listing.AvailableQuantity,
        order.CreatedAt);
}
