using System.Net;
using System.Net.Http.Json;
using CropMarket.Application.Features.Orders.Dtos;
using CropMarket.Domain.Enums;
using CropMarket.Tests.Infrastructure;
using Microsoft.AspNetCore.Mvc;

namespace CropMarket.Tests.Api;

// NFR-03 (roles and ownership) and the ProblemDetails error format, through the real HTTP pipeline
[Collection(DatabaseCollection.Name)]
public class SecurityApiTests
{
    private readonly ApiFactory _factory;

    public SecurityApiTests(ApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task TC24_Login_with_wrong_password_returns_401_problem_details()
    {
        var client = _factory.CreateClient();
        var user = await ApiClient.RegisterAsync(client, Role.Consumer);

        var response = await client.PostAsJsonAsync("/api/auth/login",
            new { email = user.Email, password = "WrongPass1!" }, ApiClient.Json);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        Assert.Equal("Email or password is incorrect.", problem!.Detail);
    }

    [Fact]
    public async Task TC25_Placing_an_order_without_a_token_returns_401()
    {
        var client = _factory.CreateClient();

        var response = await ApiClient.OrderAsync(client, listingId: 1, quantity: 1);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task TC26_Consumer_cannot_create_a_listing()
    {
        var client = _factory.CreateClient();
        var consumer = await ApiClient.RegisterAsync(client, Role.Consumer);

        var response = await client.As(consumer).PostAsJsonAsync("/api/listings", new
        {
            productName = "Fake", category = "vegetables", unitPrice = 1m,
            unit = Unit.Kg, availableQuantity = 1m, location = "Manisa"
        }, ApiClient.Json);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task TC27_Consumer_cannot_see_the_farmer_orders_list()
    {
        var client = _factory.CreateClient();
        var consumer = await ApiClient.RegisterAsync(client, Role.Consumer);

        var response = await client.As(consumer).GetAsync("/api/orders/received");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    // Open item from Week 5: a second farmer tries to change the first farmer's order
    [Fact]
    public async Task TC28_Farmer_cannot_change_the_status_of_another_farmers_order()
    {
        var farmerClient = _factory.CreateClient();
        var consumerClient = _factory.CreateClient();
        var otherFarmerClient = _factory.CreateClient();
        var farmer = await ApiClient.RegisterAsync(farmerClient, Role.Farmer);
        var consumer = await ApiClient.RegisterAsync(consumerClient, Role.Consumer);
        var otherFarmer = await ApiClient.RegisterAsync(otherFarmerClient, Role.Farmer);

        var listing = await ApiClient.CreateListingAsync(farmerClient.As(farmer));
        var orderResponse = await ApiClient.OrderAsync(consumerClient.As(consumer), listing.Id, 5);
        var order = await orderResponse.Content.ReadFromJsonAsync<OrderDto>(ApiClient.Json);

        var response = await otherFarmerClient.As(otherFarmer)
            .PatchAsJsonAsync($"/api/orders/{order!.Id}/status", new { status = OrderStatus.Delivered }, ApiClient.Json);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        Assert.Equal("You can only change the status of orders placed on your own listings.", problem!.Detail);

        // The real owner still sees the order as Pending
        var received = await farmerClient.GetFromJsonAsync<List<ReceivedOrderDto>>("/api/orders/received", ApiClient.Json);
        Assert.Equal(OrderStatus.Pending, received!.Single(o => o.Id == order.Id).Status);
    }
}