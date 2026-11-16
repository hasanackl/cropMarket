using System.Linq.Expressions;
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
    private const string StockChangedMessage =
        "The stock of this listing was changed by another order. Please refresh and try again.";

    private readonly IAppDbContext _context;

    public OrderService(IAppDbContext context)
    {
        _context = context;
    }

    // ---------- Consumer ----------

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

        var quantityError = CheckQuantity(listing.Unit, request.Quantity);
        if (quantityError is not null)
        {
            return CreateOrderResult.Failure(CreateOrderError.InvalidQuantity, quantityError);
        }

        if (request.Quantity > listing.AvailableQuantity)
        {
            return CreateOrderResult.Failure(CreateOrderError.InsufficientStock,
                NotEnoughStockMessage(request.Quantity, listing.AvailableQuantity, listing.Unit));
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
        SetStock(listing, listing.AvailableQuantity - request.Quantity);
        _context.Orders.Add(order);

        // One SaveChanges = one transaction; RowVersion stops two orders from using the same stock (ADR-02)
        if (!await TrySaveAsync())
        {
            return CreateOrderResult.Failure(CreateOrderError.StockChanged, StockChangedMessage);
        }

        return CreateOrderResult.Success(ToDto(order, listing));
    }

    public async Task<List<MyOrderDto>> GetMineAsync(int consumerId)
    {
        return await _context.Orders
            .Where(o => o.ConsumerId == consumerId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(ToMyDto)
            .ToListAsync();
    }

    // FR-07: change the amount (only while Pending) or the delivery address
    public async Task<UpdateOrderResult> UpdateAsync(int consumerId, int orderId, UpdateOrderRequest request)
    {
        // Only the consumer who placed the order can change it
        var order = await _context.Orders
            .Include(o => o.Listing)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.ConsumerId == consumerId);

        if (order is null)
        {
            return UpdateOrderResult.Failure(UpdateOrderError.OrderNotFound, "The order was not found.");
        }

        if (order.Status is OrderStatus.Delivered or OrderStatus.Cancelled)
        {
            return UpdateOrderResult.Failure(UpdateOrderError.OrderClosed,
                "Delivered or cancelled orders cannot be changed.");
        }

        if (request.Quantity != order.Quantity && order.Status != OrderStatus.Pending)
        {
            return UpdateOrderResult.Failure(UpdateOrderError.QuantityLocked,
                "The farmer is already preparing this order, so only the address can be changed.");
        }

        var quantityError = CheckQuantity(order.Listing.Unit, request.Quantity);
        if (quantityError is not null)
        {
            return UpdateOrderResult.Failure(UpdateOrderError.InvalidQuantity, quantityError);
        }

        // This order's own amount goes back to the stock first
        var available = order.Listing.AvailableQuantity + order.Quantity;

        if (request.Quantity > available)
        {
            return UpdateOrderResult.Failure(UpdateOrderError.InsufficientStock,
                NotEnoughStockMessage(request.Quantity, available, order.Listing.Unit));
        }

        SetStock(order.Listing, available - request.Quantity);
        order.Quantity = request.Quantity;
        order.TotalPrice = decimal.Round(request.Quantity * order.UnitPriceAtOrder, 2);
        order.DeliveryAddress = request.DeliveryAddress.Trim();

        if (!await TrySaveAsync())
        {
            return UpdateOrderResult.Failure(UpdateOrderError.StockChanged, StockChangedMessage);
        }

        return UpdateOrderResult.Success(await GetMyOrderAsync(order.Id));
    }

    // FR-08: cancel while Pending; the amount goes back to the stock
    public async Task<CancelOrderResult> CancelAsync(int consumerId, int orderId)
    {
        var order = await _context.Orders
            .Include(o => o.Listing)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.ConsumerId == consumerId);

        if (order is null)
        {
            return CancelOrderResult.Failure(CancelOrderError.OrderNotFound, "The order was not found.");
        }

        // Once the farmer starts preparing, the order can't be cancelled
        if (order.Status != OrderStatus.Pending)
        {
            return CancelOrderResult.Failure(CancelOrderError.NotPending,
                "Only pending orders can be cancelled.");
        }

        SetStock(order.Listing, order.Listing.AvailableQuantity + order.Quantity);
        order.Status = OrderStatus.Cancelled;

        if (!await TrySaveAsync())
        {
            return CancelOrderResult.Failure(CancelOrderError.StockChanged, StockChangedMessage);
        }

        return CancelOrderResult.Success(await GetMyOrderAsync(order.Id));
    }

    // ---------- Farmer ----------

    // FR-06
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
            return UpdateOrderStatusResult.Failure(UpdateOrderStatusError.OrderNotFound, "The order was not found.");
        }

        // NFR-03: a farmer can only change orders on their own listings
        if (order.Listing.FarmerId != farmerId)
        {
            return UpdateOrderStatusResult.Failure(UpdateOrderStatusError.NotYourOrder,
                "You can only change the status of orders placed on your own listings.");
        }

        var newStatus = request.Status!.Value;

        // Only the consumer can cancel, and a cancelled order never changes again
        if (newStatus == OrderStatus.Cancelled || order.Status == OrderStatus.Cancelled)
        {
            return UpdateOrderStatusResult.Failure(UpdateOrderStatusError.InvalidTransition,
                "Only the consumer can cancel an order, and a cancelled order cannot be changed.");
        }

        // Pending = 0, Preparing = 1, Delivered = 2, so "forward" means a bigger value
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

    // FR-09: new-order notifications for the farmer
    public async Task<int> GetUnseenCountAsync(int farmerId)
    {
        return await UnseenOrders(farmerId).CountAsync();
    }

    public async Task<List<ReceivedOrderDto>> GetUnseenAsync(int farmerId)
    {
        // Only the newest 5; the orders page shows the rest
        return await UnseenOrders(farmerId)
            .OrderByDescending(o => o.CreatedAt)
            .Take(5)
            .Select(ToReceivedDto)
            .ToListAsync();
    }

    public async Task MarkSeenAsync(int farmerId)
    {
        var orders = await _context.Orders
            .Where(o => o.Listing.FarmerId == farmerId && !o.IsSeenByFarmer)
            .ToListAsync();

        foreach (var order in orders)
        {
            order.IsSeenByFarmer = true;
        }

        await _context.SaveChangesAsync();
    }

    // ---------- Shared helpers ----------

    // Used by Create and Update, so the quantity rules live in one place (NFR-02)
    private static string? CheckQuantity(Unit unit, decimal quantity)
    {
        if (quantity <= 0)
        {
            return "Quantity must be greater than zero.";
        }

        // Pieces and boxes cannot be split; only kilograms may have decimals
        if (unit != Unit.Kg && quantity != decimal.Floor(quantity))
        {
            return $"Quantity must be a whole number for unit {unit}.";
        }

        return null;
    }

    private static string NotEnoughStockMessage(decimal requested, decimal available, Unit unit) =>
        $"Requested {requested:0.##} {unit} but only {available:0.##} {unit} is available.";

    // A listing is on sale only while it has stock
    private static void SetStock(Listing listing, decimal quantity)
    {
        listing.AvailableQuantity = quantity;
        listing.IsActive = quantity > 0;
    }

    private async Task<bool> TrySaveAsync()
    {
        try
        {
            await _context.SaveChangesAsync();
            return true;
        }
        catch (DbUpdateConcurrencyException)
        {
            return false;
        }
    }

    private IQueryable<Order> UnseenOrders(int farmerId) =>
        _context.Orders.Where(o => o.Listing.FarmerId == farmerId
                                   && !o.IsSeenByFarmer
                                   && o.Status != OrderStatus.Cancelled);

    private async Task<MyOrderDto> GetMyOrderAsync(int orderId) =>
        await _context.Orders.Where(o => o.Id == orderId).Select(ToMyDto).FirstAsync();

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

    private static readonly Expression<Func<Order, MyOrderDto>> ToMyDto = o => new MyOrderDto(
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
        o.CreatedAt,
        o.Listing.ImageUrl);

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
        o.CreatedAt,
        o.Listing.ImageUrl);
}