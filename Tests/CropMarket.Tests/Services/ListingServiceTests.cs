using CropMarket.Application.Features.Listings;
using CropMarket.Application.Features.Listings.Requests;
using CropMarket.Application.Features.Listings.Results;
using CropMarket.Domain.Entities;
using CropMarket.Domain.Enums;
using CropMarket.Tests.Infrastructure;

namespace CropMarket.Tests.Services;

// FR-02 (create), FR-03 (search), FR-10 (edit), NFR-03 (ownership)
[Collection(DatabaseCollection.Name)]
public class ListingServiceTests
{
    private readonly TestDatabase _db;

    public ListingServiceTests(TestDatabase db)
    {
        _db = db;
    }

    [Fact]
    public async Task TC06_Search_ignores_letter_case_and_hides_inactive_listings()
    {
        await using var context = _db.CreateContext();
        var farmer = await TestData.AddUserAsync(context, Role.Farmer);
        // A product name no other test uses, so only these two rows can match
        var name = $"Cherry{Guid.NewGuid():N}"[..14];
        var active = await TestData.AddListingAsync(context, farmer.Id, productName: name);
        await TestData.AddListingAsync(context, farmer.Id, productName: name, isActive: false);

        var results = await new ListingService(context).SearchAsync(name.ToLower(), null, null);

        var only = Assert.Single(results);
        Assert.Equal(active.Id, only.Id);
    }

    [Fact]
    public async Task TC07_Search_by_location_finds_a_Turkish_city_name_typed_in_lower_case()
    {
        await using var context = _db.CreateContext();
        var farmer = await TestData.AddUserAsync(context, Role.Farmer);
        var name = $"Fig{Guid.NewGuid():N}"[..14];
        var listing = await TestData.AddListingAsync(context, farmer.Id, productName: name, location: "İzmir");

        var results = await new ListingService(context).SearchAsync(name, null, "izmir");

        var only = Assert.Single(results);
        Assert.Equal(listing.Id, only.Id);
    }

    [Theory]
    [InlineData("toys", "Manisa", SaveListingError.InvalidCategory)]
    [InlineData("vegetables", "Atlantis", SaveListingError.InvalidCity)]
    public async Task TC08_Create_listing_with_unknown_category_or_city_is_rejected(
        string category, string location, SaveListingError expected)
    {
        await using var context = _db.CreateContext();
        var farmer = await TestData.AddUserAsync(context, Role.Farmer);
        var countBefore = context.Listings.Count(l => l.FarmerId == farmer.Id);

        var result = await new ListingService(context).CreateAsync(farmer.Id,
            new CreateListingRequest("Pepper", category, 15m, Unit.Kg, 30m, location));

        Assert.False(result.IsSuccess);
        Assert.Equal(expected, result.Error);
        Assert.Equal(countBefore, context.Listings.Count(l => l.FarmerId == farmer.Id));
    }

    [Fact]
    public async Task TC09_Farmer_cannot_edit_another_farmers_listing()
    {
        await using var context = _db.CreateContext();
        var owner = await TestData.AddUserAsync(context, Role.Farmer);
        var otherFarmer = await TestData.AddUserAsync(context, Role.Farmer);
        var listing = await TestData.AddListingAsync(context, owner.Id, price: 20m);

        var result = await new ListingService(context).UpdateAsync(otherFarmer.Id, listing.Id,
            new UpdateListingRequest("Tomato", "vegetables", 1m, Unit.Kg, 50m, "Manisa"));

        Assert.Equal(SaveListingError.ListingNotFound, result.Error);

        await using var check = _db.CreateContext();
        Assert.Equal(20m, check.Listings.Single(l => l.Id == listing.Id).UnitPrice);
    }

    [Fact]
    public async Task TC10_Unit_of_a_listing_with_orders_cannot_be_changed()
    {
        await using var context = _db.CreateContext();
        var farmer = await TestData.AddUserAsync(context, Role.Farmer);
        var consumer = await TestData.AddUserAsync(context, Role.Consumer);
        var listing = await TestData.AddListingAsync(context, farmer.Id, unit: Unit.Kg);
        context.Orders.Add(new Order
        {
            ListingId = listing.Id, ConsumerId = consumer.Id, Quantity = 5,
            UnitPriceAtOrder = 20m, TotalPrice = 100m, DeliveryAddress = "Test street 1"
        });
        await context.SaveChangesAsync();

        var result = await new ListingService(context).UpdateAsync(farmer.Id, listing.Id,
            new UpdateListingRequest("Tomato", "vegetables", 20m, Unit.Box, 45m, "Manisa"));

        Assert.Equal(SaveListingError.UnitLocked, result.Error);
    }
}