using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using CropMarket.Application.Features.Auth.Dtos;
using CropMarket.Application.Features.Listings.Dtos;
using CropMarket.Domain.Enums;

namespace CropMarket.Tests.Infrastructure;

// Small helpers so each API test reads like the real user flow
public static class ApiClient
{
    // Same JSON rules as Program.cs: enums as camelCase text
    public static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase, allowIntegerValues: false) }
    };

    public const string Password = "Secret123!";

    public static async Task<AuthResponse> RegisterAsync(HttpClient client, Role role)
    {
        var response = await client.PostAsJsonAsync("/api/auth/register", new
        {
            fullName = $"Api {role}",
            email = $"api-{role.ToString().ToLower()}-{Guid.NewGuid():N}@test.local",
            password = Password,
            phoneNumber = "05550000000",
            role
        }, Json);

        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<AuthResponse>(Json))!;
    }

    public static HttpClient As(this HttpClient client, AuthResponse user)
    {
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", user.Token);
        return client;
    }

    public static async Task<ListingDto> CreateListingAsync(HttpClient farmerClient, decimal quantity = 50, string productName = "Tomato")
    {
        var response = await farmerClient.PostAsJsonAsync("/api/listings", new
        {
            productName,
            category = "vegetables",
            unitPrice = 20m,
            unit = Unit.Kg,
            availableQuantity = quantity,
            location = "Manisa"
        }, Json);

        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<ListingDto>(Json))!;
    }

    public static Task<HttpResponseMessage> OrderAsync(HttpClient consumerClient, int listingId, decimal quantity) =>
        consumerClient.PostAsJsonAsync("/api/orders",
            new { listingId, quantity, deliveryAddress = "Test street 1, Manisa" }, Json);
}