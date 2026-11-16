using CropMarket.Application.Common.Interfaces;
using CropMarket.Application.Features.Orders.Dtos;
using CropMarket.Application.Features.Orders.Requests;
using CropMarket.Application.Features.Orders.Results;
using CropMarket.Domain.Entities;
using CropMarket.Domain.Enums;
using Microsoft.EntityFrameworkCore;

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
