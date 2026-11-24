using System.Net;
using System.Net.Http.Json;
using CropMarket.Application.Features.Listings.Dtos;
using CropMarket.Application.Features.Orders.Dtos;
using CropMarket.Domain.Enums;
using CropMarket.Tests.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Xunit.Abstractions;

namespace CropMarket.Tests.Api;

// System-level checks of the main scenario (US-02, US-03) and the stock rules over HTTP
[Collection(DatabaseCollection.Name)]
public class OrderFlowApiTests
{
    private readonly ApiFactory _factory;
    private readonly ITestOutputHelper _output;

    public OrderFlowApiTests(ApiFactory factory, ITestOutputHelper output)
    {
        _factory = factory;
        _output = output;
    }

    // FR-01 to FR-06 in one flow: register, list, search, order, stock, status, consumer view
    [Fact]
    public async Task TC29_Full_order_flow_from_listing_to_delivery()
    {
        var farmerClient = _factory.CreateClient();
        var consumerClient = _factory.CreateClient();
        var farmer = await ApiClient.RegisterAsync(farmerClient, Role.Farmer);
        var consumer = await ApiClient.RegisterAsync(consumerClient, Role.Consumer);
        var productName = $"Flow{Guid.NewGuid():N}"[..14];

        var listing = await ApiClient.CreateListingAsync(farmerClient.As(farmer), 50, productName);

        var found = await consumerClient.GetFromJsonAsync<List<ListingDto>>($"/api/listings?search={productName}", ApiClient.Json);
        Assert.Equal(listing.Id, Assert.Single(found!).Id);

        var orderResponse = await ApiClient.OrderAsync(consumerClient.As(consumer), listing.Id, 10);
        Assert.Equal(HttpStatusCode.Created, orderResponse.StatusCode);
        var order = (await orderResponse.Content.ReadFromJsonAsync<OrderDto>(ApiClient.Json))!;
        Assert.Equal(40m, order.RemainingQuantity);

        foreach (var status in new[] { OrderStatus.Preparing, OrderStatus.Delivered })
        {
            var patch = await farmerClient.PatchAsJsonAsync($"/api/orders/{order.Id}/status", new { status }, ApiClient.Json);
            Assert.Equal(HttpStatusCode.OK, patch.StatusCode);
        }

        var mine = await consumerClient.GetFromJsonAsync<List<MyOrderDto>>("/api/orders/mine", ApiClient.Json);
        Assert.Equal(OrderStatus.Delivered, mine!.Single(o => o.Id == order.Id).Status);

        var after = await consumerClient.GetFromJsonAsync<ListingDto>($"/api/listings/{listing.Id}", ApiClient.Json);
        Assert.Equal(40m, after!.AvailableQuantity);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(51)]
    public async Task TC30_Invalid_order_quantity_returns_400_with_a_clear_message(int quantity)
    {
        var farmerClient = _factory.CreateClient();
        var consumerClient = _factory.CreateClient();
        var listing = await ApiClient.CreateListingAsync(farmerClient.As(await ApiClient.RegisterAsync(farmerClient, Role.Farmer)));
        consumerClient.As(await ApiClient.RegisterAsync(consumerClient, Role.Consumer));

        var response = await ApiClient.OrderAsync(consumerClient, listing.Id, quantity);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        Assert.False(string.IsNullOrWhiteSpace(problem!.Detail));
        _output.WriteLine($"quantity {quantity}: {problem.Detail}");
    }

    // Five consumers order 10 kg each at the same moment from a 20 kg listing.
    // Expected: at most two orders succeed. Every other answer is 409 (conflict: the stock changed while saving),
    // 400 (not enough stock left) or 404 (the listing sold out and is no longer active).
    // The stock is never negative and matches the saved orders (FR-05, ADR-02).
    [Fact]
    public async Task TC31_Parallel_orders_never_sell_more_than_the_stock()
    {
        var farmerClient = _factory.CreateClient();
        var listing = await ApiClient.CreateListingAsync(farmerClient.As(await ApiClient.RegisterAsync(farmerClient, Role.Farmer)), 20);

        var consumers = new List<HttpClient>();
        for (var i = 0; i < 5; i++)
        {
            var client = _factory.CreateClient();
            consumers.Add(client.As(await ApiClient.RegisterAsync(client, Role.Consumer)));
        }

        var responses = await Task.WhenAll(consumers.Select(c => ApiClient.OrderAsync(c, listing.Id, 10)));
        var codes = responses.Select(r => (int)r.StatusCode).ToList();
        _output.WriteLine("Status codes: " + string.Join(", ", codes));

        var created = codes.Count(c => c == 201);
        Assert.InRange(created, 1, 2);
        Assert.All(codes.Where(c => c != 201), c => Assert.Contains(c, new[] { 400, 404, 409 }));

        var mine = await farmerClient.GetFromJsonAsync<List<MyListingDto>>("/api/listings/mine", ApiClient.Json);
        var stock = mine!.Single(l => l.Id == listing.Id).AvailableQuantity;
        _output.WriteLine($"Created: {created}, remaining stock: {stock}");
        Assert.Equal(20m - 10m * created, stock);
    }
}