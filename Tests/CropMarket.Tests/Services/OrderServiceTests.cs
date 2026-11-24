using CropMarket.Application.Features.Listings;
using CropMarket.Application.Features.Orders;
using CropMarket.Application.Features.Orders.Requests;
using CropMarket.Application.Features.Orders.Results;
using CropMarket.Domain.Entities;
using CropMarket.Domain.Enums;
using CropMarket.Persistence;
using CropMarket.Tests.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace CropMarket.Tests.Services;

// FR-04 to FR-09, NFR-02 (invalid quantity), NFR-03 (ownership), ADR-02 (RowVersion)
[Collection(DatabaseCollection.Name)]
public class OrderServiceTests
{
    private const string Address = "Test street 1, Manisa";
    private readonly TestDatabase _db;

    public OrderServiceTests(TestDatabase db)
    {
        _db = db;
    }

    // A farmer with one listing (default 50 kg at 20 TL) and a consumer
    private async Task<(User Farmer, User Consumer, Listing Listing)> ArrangeAsync(
        decimal quantity = 50, Unit unit = Unit.Kg)
    {
        await using var context = _db.CreateContext();
        var farmer = await TestData.AddUserAsync(context, Role.Farmer);
        var consumer = await TestData.AddUserAsync(context, Role.Consumer);
        var listing = await TestData.AddListingAsync(context, farmer.Id, quantity, unit, price: 20m);
        return (farmer, consumer, listing);
    }

    private async Task<Listing> ReloadListingAsync(int id)
    {
        await using var context = _db.CreateContext();
        return await context.Listings.AsNoTracking().SingleAsync(l => l.Id == id);
    }

    private async Task<int> PlaceOrderAsync(int consumerId, int listingId, decimal quantity)
    {
        await using var context = _db.CreateContext();
        var result = await new OrderService(context)
            .CreateAsync(consumerId, new CreateOrderRequest(listingId, quantity, Address));
        Assert.True(result.IsSuccess, result.Message);
        return result.Order!.Id;
    }

    // ---------- Placing orders (FR-04, FR-05, NFR-02) ----------

    [Fact]
    public async Task TC11_Valid_order_reduces_the_stock_and_copies_the_price()
    {
        var (_, consumer, listing) = await ArrangeAsync();
        await using var context = _db.CreateContext();

        var result = await new OrderService(context)
            .CreateAsync(consumer.Id, new CreateOrderRequest(listing.Id, 10, Address));

        Assert.True(result.IsSuccess, result.Message);
        Assert.Equal(20m, result.Order!.UnitPriceAtOrder);
        Assert.Equal(200m, result.Order.TotalPrice);
        Assert.Equal(OrderStatus.Pending, result.Order.Status);
        Assert.Equal(40m, (await ReloadListingAsync(listing.Id)).AvailableQuantity);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task TC12_Order_with_zero_or_negative_quantity_is_rejected(int quantity)
    {
        var (_, consumer, listing) = await ArrangeAsync();
        await using var context = _db.CreateContext();

        var result = await new OrderService(context)
            .CreateAsync(consumer.Id, new CreateOrderRequest(listing.Id, quantity, Address));

        Assert.Equal(CreateOrderError.InvalidQuantity, result.Error);
        Assert.Equal(50m, (await ReloadListingAsync(listing.Id)).AvailableQuantity);
    }

    [Fact]
    public async Task TC13_Order_for_more_than_the_stock_is_rejected()
    {
        var (_, consumer, listing) = await ArrangeAsync();
        await using var context = _db.CreateContext();

        var result = await new OrderService(context)
            .CreateAsync(consumer.Id, new CreateOrderRequest(listing.Id, 51, Address));

        Assert.Equal(CreateOrderError.InsufficientStock, result.Error);
        Assert.Equal(50m, (await ReloadListingAsync(listing.Id)).AvailableQuantity);
    }

    [Fact]
    public async Task TC14_Order_for_exactly_the_whole_stock_sells_out_and_hides_the_listing()
    {
        var (_, consumer, listing) = await ArrangeAsync();

        await PlaceOrderAsync(consumer.Id, listing.Id, 50);

        var after = await ReloadListingAsync(listing.Id);
        Assert.Equal(0m, after.AvailableQuantity);
        Assert.False(after.IsActive);

        await using var context = _db.CreateContext();
        Assert.Null(await new ListingService(context).GetByIdAsync(listing.Id));
    }

    [Fact]
    public async Task TC15_Decimal_quantity_for_a_piece_unit_is_rejected()
    {
        var (_, consumer, listing) = await ArrangeAsync(quantity: 20, unit: Unit.Piece);
        await using var context = _db.CreateContext();

        var result = await new OrderService(context)
            .CreateAsync(consumer.Id, new CreateOrderRequest(listing.Id, 1.5m, Address));

        Assert.Equal(CreateOrderError.InvalidQuantity, result.Error);
    }

    [Fact]
    public async Task TC16_Order_on_an_inactive_listing_is_rejected()
    {
        await using var context = _db.CreateContext();
        var farmer = await TestData.AddUserAsync(context, Role.Farmer);
        var consumer = await TestData.AddUserAsync(context, Role.Consumer);
        var listing = await TestData.AddListingAsync(context, farmer.Id, isActive: false);

        var result = await new OrderService(context)
            .CreateAsync(consumer.Id, new CreateOrderRequest(listing.Id, 1, Address));

        Assert.Equal(CreateOrderError.ListingNotFound, result.Error);
    }

    // Two consumers open the same listing; the first one saves, the second one still holds the old stock.
    // RowVersion must stop the second save, so the stock is never used twice (FR-05, ADR-02).
    [Fact]
    public async Task TC17_Second_order_based_on_an_old_stock_value_gets_a_conflict()
    {
        var (_, consumer, listing) = await ArrangeAsync();
        var otherConsumer = await AddConsumerAsync();

        await using var secondContext = _db.CreateContext();
        // The second consumer reads the listing (stock 50) before the first order is saved
        await secondContext.Listings.SingleAsync(l => l.Id == listing.Id);

        await PlaceOrderAsync(consumer.Id, listing.Id, 10);

        var result = await new OrderService(secondContext)
            .CreateAsync(otherConsumer.Id, new CreateOrderRequest(listing.Id, 10, Address));

        Assert.Equal(CreateOrderError.StockChanged, result.Error);

        await using var check = _db.CreateContext();
        Assert.Equal(40m, (await ReloadListingAsync(listing.Id)).AvailableQuantity);
        Assert.Equal(1, await check.Orders.CountAsync(o => o.ListingId == listing.Id));
    }

    // ---------- Order status (FR-06, NFR-03) ----------

    [Fact]
    public async Task TC18_Farmer_cannot_change_an_order_on_another_farmers_listing()
    {
        var (_, consumer, listing) = await ArrangeAsync();
        var orderId = await PlaceOrderAsync(consumer.Id, listing.Id, 5);
        await using var context = _db.CreateContext();
        var otherFarmer = await TestData.AddUserAsync(context, Role.Farmer);

        var result = await new OrderService(context).UpdateStatusAsync(otherFarmer.Id, orderId,
            new UpdateOrderStatusRequest(OrderStatus.Delivered));

        Assert.Equal(UpdateOrderStatusError.NotYourOrder, result.Error);
        await using var check = _db.CreateContext();
        Assert.Equal(OrderStatus.Pending, (await check.Orders.SingleAsync(o => o.Id == orderId)).Status);
    }

    [Fact]
    public async Task TC19_Status_moves_only_forward()
    {
        var (farmer, consumer, listing) = await ArrangeAsync();
        var orderId = await PlaceOrderAsync(consumer.Id, listing.Id, 5);
        await using var context = _db.CreateContext();
        var service = new OrderService(context);

        var preparing = await service.UpdateStatusAsync(farmer.Id, orderId, new UpdateOrderStatusRequest(OrderStatus.Preparing));
        var delivered = await service.UpdateStatusAsync(farmer.Id, orderId, new UpdateOrderStatusRequest(OrderStatus.Delivered));
        var backwards = await service.UpdateStatusAsync(farmer.Id, orderId, new UpdateOrderStatusRequest(OrderStatus.Pending));

        Assert.True(preparing.IsSuccess, preparing.Message);
        Assert.True(delivered.IsSuccess, delivered.Message);
        Assert.Equal(UpdateOrderStatusError.InvalidTransition, backwards.Error);
    }

    [Fact]
    public async Task TC20_Farmer_cannot_cancel_an_order()
    {
        var (farmer, consumer, listing) = await ArrangeAsync();
        var orderId = await PlaceOrderAsync(consumer.Id, listing.Id, 5);
        await using var context = _db.CreateContext();

        var result = await new OrderService(context).UpdateStatusAsync(farmer.Id, orderId,
            new UpdateOrderStatusRequest(OrderStatus.Cancelled));

        Assert.Equal(UpdateOrderStatusError.InvalidTransition, result.Error);
    }

    // ---------- Edit and cancel (FR-07, FR-08) ----------

    [Fact]
    public async Task TC21_Cancelling_a_pending_order_returns_the_stock_and_works_only_once()
    {
        var (_, consumer, listing) = await ArrangeAsync();
        var orderId = await PlaceOrderAsync(consumer.Id, listing.Id, 10);
        await using var context = _db.CreateContext();
        var service = new OrderService(context);

        var first = await service.CancelAsync(consumer.Id, orderId);
        var second = await service.CancelAsync(consumer.Id, orderId);

        Assert.True(first.IsSuccess, first.Message);
        Assert.Equal(OrderStatus.Cancelled, first.Order!.Status);
        Assert.Equal(CancelOrderError.NotPending, second.Error);
        Assert.Equal(50m, (await ReloadListingAsync(listing.Id)).AvailableQuantity);
    }

    [Fact]
    public async Task TC22_Quantity_is_locked_once_the_farmer_is_preparing_but_the_address_can_change()
    {
        var (farmer, consumer, listing) = await ArrangeAsync();
        var orderId = await PlaceOrderAsync(consumer.Id, listing.Id, 10);
        await using var context = _db.CreateContext();
        var service = new OrderService(context);
        await service.UpdateStatusAsync(farmer.Id, orderId, new UpdateOrderStatusRequest(OrderStatus.Preparing));

        var newQuantity = await service.UpdateAsync(consumer.Id, orderId, new UpdateOrderRequest(12, Address));
        var newAddress = await service.UpdateAsync(consumer.Id, orderId, new UpdateOrderRequest(10, "New street 5, Manisa"));

        Assert.Equal(UpdateOrderError.QuantityLocked, newQuantity.Error);
        Assert.True(newAddress.IsSuccess, newAddress.Message);
        Assert.Equal("New street 5, Manisa", newAddress.Order!.DeliveryAddress);
        Assert.Equal(40m, (await ReloadListingAsync(listing.Id)).AvailableQuantity);
    }

    // ---------- Notifications (FR-09) ----------

    [Fact]
    public async Task TC23_New_orders_are_counted_until_the_farmer_marks_them_seen()
    {
        var (farmer, consumer, listing) = await ArrangeAsync();
        await PlaceOrderAsync(consumer.Id, listing.Id, 5);
        var cancelledId = await PlaceOrderAsync(consumer.Id, listing.Id, 5);
        await using var context = _db.CreateContext();
        var service = new OrderService(context);
        await service.CancelAsync(consumer.Id, cancelledId);

        var before = await service.GetUnseenCountAsync(farmer.Id);
        await service.MarkSeenAsync(farmer.Id);
        var after = await service.GetUnseenCountAsync(farmer.Id);

        Assert.Equal(1, before);   // the cancelled order is not counted
        Assert.Equal(0, after);
    }

    private async Task<User> AddConsumerAsync()
    {
        await using var context = _db.CreateContext();
        return await TestData.AddUserAsync(context, Role.Consumer);
    }
}