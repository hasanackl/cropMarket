using CropMarket.Domain.Entities;
using CropMarket.Domain.Enums;
using CropMarket.Persistence;

namespace CropMarket.Tests.Infrastructure;

// Creates the rows a test needs. Every e-mail is unique, so tests never depend on each other's data.
public static class TestData
{
    public static async Task<User> AddUserAsync(AppDbContext context, Role role, string? email = null, string passwordHash = "not-used")
    {
        var user = new User
        {
            FullName = $"Test {role}",
            Email = email ?? $"{role.ToString().ToLower()}-{Guid.NewGuid():N}@test.local",
            PasswordHash = passwordHash,
            PhoneNumber = "05550000000",
            Role = role
        };

        context.Users.Add(user);
        await context.SaveChangesAsync();
        return user;
    }

    public static async Task<Listing> AddListingAsync(
        AppDbContext context,
        int farmerId,
        decimal quantity = 50,
        Unit unit = Unit.Kg,
        decimal price = 20m,
        string productName = "Tomato",
        string location = "Manisa",
        bool isActive = true)
    {
        var listing = new Listing
        {
            FarmerId = farmerId,
            ProductName = productName,
            Category = "vegetables",
            UnitPrice = price,
            Unit = unit,
            AvailableQuantity = quantity,
            Location = location,
            IsActive = isActive
        };

        context.Listings.Add(listing);
        await context.SaveChangesAsync();
        return listing;
    }
}