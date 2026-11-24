using System.Net;
using System.Net.Http.Json;
using CropMarket.Application.Features.Orders;
using CropMarket.Application.Features.Orders.Requests;
using CropMarket.Application.Features.Orders.Results;
using CropMarket.Domain.Enums;
using CropMarket.Tests.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Xunit.Abstractions;

namespace CropMarket.Tests.Robustness;

// Edge cases chosen from the data model and the error handling, not from the happy path
[Collection(DatabaseCollection.Name)]
public class BoundaryTests
{
    private readonly TestDatabase _db;
    private readonly ApiFactory _factory;
    private readonly ITestOutputHelper _output;

    public BoundaryTests(TestDatabase db, ApiFactory factory, ITestOutputHelper output)
    {
        _db = db;
        _factory = factory;
        _output = output;
    }

    // Order.Quantity and Listing.AvailableQuantity are decimal(10,2) in the database (NFR-02).
    // A quantity with more than two decimals cannot be stored exactly, so it must be rejected
    // and the stock must stay the same.
    [Theory]
    [InlineData("0.001")]
    [InlineData("10.555")]
    public async Task TC33_Order_quantity_with_more_than_two_decimals_is_rejected(string quantityText)
    {
        var quantity = decimal.Parse(quantityText, System.Globalization.CultureInfo.InvariantCulture);
        await using var context = _db.CreateContext();
        var farmer = await TestData.AddUserAsync(context, Role.Farmer);
        var consumer = await TestData.AddUserAsync(context, Role.Consumer);
        var listing = await TestData.AddListingAsync(context, farmer.Id, 50, Unit.Kg);

        var result = await new OrderService(context)
            .CreateAsync(consumer.Id, new CreateOrderRequest(listing.Id, quantity, "Test street 1"));

        await using var check = _db.CreateContext();
        var stock = (await check.Listings.SingleAsync(l => l.Id == listing.Id)).AvailableQuantity;
        var saved = await check.Orders.Where(o => o.ListingId == listing.Id).Select(o => o.Quantity).ToListAsync();
        _output.WriteLine($"quantity {quantityText}: error = {result.Error?.ToString() ?? "none"}, " +
                          $"stock after = {stock}, saved order quantities = [{string.Join(", ", saved)}]");

        Assert.Equal(CreateOrderError.InvalidQuantity, result.Error);
        Assert.Equal(50m, stock);
    }

    // Two sign-up forms are sent at the same moment with the same e-mail (e.g. a double click).
    // Expected: one account is created (200) and the other request gets 409, never a 500 server error (FR-01).
    [Fact]
    public async Task TC34_Two_parallel_registrations_with_the_same_email_give_200_and_409()
    {
        var email = $"twice-{Guid.NewGuid():N}@test.local";
        var body = new { fullName = "Double Click", email, password = ApiClient.Password, phoneNumber = (string?)null, role = Role.Consumer };

        var responses = await Task.WhenAll(Enumerable.Range(0, 2).Select(_ =>
            _factory.CreateClient().PostAsJsonAsync("/api/auth/register", body, ApiClient.Json)));
        var codes = responses.Select(r => (int)r.StatusCode).OrderBy(c => c).ToList();
        _output.WriteLine("Status codes: " + string.Join(", ", codes));

        Assert.Equal(new[] { 200, 409 }, codes);
    }
}