using System.Linq.Expressions;
using CropMarket.Application.Common.Interfaces;
using CropMarket.Application.Features.Listings.Dtos;
using CropMarket.Application.Features.Listings.Requests;
using CropMarket.Application.Features.Listings.Results;
using CropMarket.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CropMarket.Application.Features.Listings;

public class ListingService : IListingService
{
    private readonly IAppDbContext _context;

    public ListingService(IAppDbContext context)
    {
        _context = context;
    }

    // FR-03
    public async Task<List<ListingDto>> SearchAsync(string? search, string? category, string? location)
    {
        var query = _context.Listings.Where(l => l.IsActive);

        // ToLower makes the search case-insensitive: "tomato" also finds "Tomato"
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(l => l.ProductName.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            var cat = category.Trim().ToLower();
            query = query.Where(l => l.Category.ToLower() == cat);
        }

        if (!string.IsNullOrWhiteSpace(location))
        {
            var loc = location.Trim().ToLower();
            query = query.Where(l => l.Location.ToLower().Contains(loc));
        }

        return await query
            .OrderByDescending(l => l.CreatedAt)
            .Select(ToDto)
            .ToListAsync();
    }

    public async Task<ListingDto?> GetByIdAsync(int id)
    {
        return await _context.Listings
            .Where(l => l.IsActive && l.Id == id)
            .Select(ToDto)
            .FirstOrDefaultAsync();
    }

    // FR-02
    public async Task<SaveListingResult> CreateAsync(int farmerId, CreateListingRequest request)
    {
        var category = ListingCategories.Normalize(request.Category);
        var city = await FindCityAsync(request.Location);

        var error = CheckCategoryAndCity(category, city);
        if (error is not null)
        {
            return error;
        }

        var listing = new Listing
        {
            FarmerId = farmerId,
            ProductName = request.ProductName.Trim(),
            Category = category!,
            UnitPrice = request.UnitPrice,
            Unit = request.Unit!.Value,
            AvailableQuantity = request.AvailableQuantity,
            Location = city!
        };

        _context.Listings.Add(listing);
        await _context.SaveChangesAsync();

        // Read it back so the DTO includes the farmer's name
        return SaveListingResult.Success((await GetByIdAsync(listing.Id))!);
    }

    // "My listings": all listings of this farmer, also the sold-out ones
    public async Task<List<MyListingDto>> GetMineAsync(int farmerId)
    {
        return await _context.Listings
            .Where(l => l.FarmerId == farmerId)
            .OrderByDescending(l => l.CreatedAt)
            .Select(l => new MyListingDto(
                l.Id,
                l.ProductName,
                l.Category,
                l.UnitPrice,
                l.Unit,
                l.AvailableQuantity,
                l.Location,
                l.IsActive,
                l.Orders.Count,
                l.CreatedAt,
                l.ImageUrl))
            .ToListAsync();
    }

    // FR-10: another farmer's listing is treated as "not found"
    public async Task<EditListingDto?> GetForEditAsync(int farmerId, int id)
    {
        return await _context.Listings
            .Where(l => l.Id == id && l.FarmerId == farmerId)
            .Select(l => new EditListingDto(
                l.Id,
                l.ProductName,
                l.Category,
                l.UnitPrice,
                l.Unit,
                l.AvailableQuantity,
                l.Location,
                l.ImageUrl,
                l.Orders.Any()))
            .FirstOrDefaultAsync();
    }

    // FR-10
    public async Task<SaveListingResult> UpdateAsync(int farmerId, int id, UpdateListingRequest request)
    {
        var listing = await _context.Listings
            .Include(l => l.Orders)
            .FirstOrDefaultAsync(l => l.Id == id && l.FarmerId == farmerId);

        if (listing is null)
        {
            return NotFound();
        }

        var category = ListingCategories.Normalize(request.Category);
        var city = await FindCityAsync(request.Location);

        var error = CheckCategoryAndCity(category, city);
        if (error is not null)
        {
            return error;
        }

        // Old orders show the listing's unit, so it can't change once someone has ordered
        if (request.Unit != listing.Unit && listing.Orders.Count > 0)
        {
            return SaveListingResult.Failure(SaveListingError.UnitLocked,
                "This listing already has orders, so its unit cannot be changed.");
        }

        listing.ProductName = request.ProductName.Trim();
        listing.Category = category!;
        listing.UnitPrice = request.UnitPrice;
        listing.Unit = request.Unit!.Value;
        listing.Location = city!;

        // New stock puts a sold-out listing back on sale
        listing.AvailableQuantity = request.AvailableQuantity;
        listing.IsActive = request.AvailableQuantity > 0;

        // A consumer may order at the same moment; RowVersion catches it (ADR-02)
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            return SaveListingResult.Failure(SaveListingError.StockChanged,
                "An order changed the stock while you were editing. Please reload the listing and try again.");
        }

        return SaveListingResult.Success(await GetAnyByIdAsync(listing.Id));
    }

    // FR-12: the controller saves the file; here only the path is stored
    public async Task<SaveListingResult> SetImageAsync(int farmerId, int id, string imageUrl)
    {
        var listing = await _context.Listings.FirstOrDefaultAsync(l => l.Id == id && l.FarmerId == farmerId);

        if (listing is null)
        {
            return NotFound();
        }

        listing.ImageUrl = imageUrl;
        await _context.SaveChangesAsync();

        return SaveListingResult.Success(await GetAnyByIdAsync(listing.Id));
    }

    // ---------- Helpers ----------

    // Returns the city name as it is stored in the Cities table, or null
    private async Task<string?> FindCityAsync(string location)
    {
        var name = location.Trim();
        return await _context.Cities
            .Where(c => c.Name == name)
            .Select(c => c.Name)
            .FirstOrDefaultAsync();
    }

    private static SaveListingResult? CheckCategoryAndCity(string? category, string? city)
    {
        if (category is null)
        {
            return SaveListingResult.Failure(SaveListingError.InvalidCategory,
                $"Category must be one of: {string.Join(", ", ListingCategories.All)}.");
        }

        if (city is null)
        {
            return SaveListingResult.Failure(SaveListingError.InvalidCity,
                "Location must be a city from GET /api/cities.");
        }

        return null;
    }

    private static SaveListingResult NotFound() =>
        SaveListingResult.Failure(SaveListingError.ListingNotFound, "The listing was not found.");

    // Also returns sold-out listings (the farmer may set the stock to zero)
    private async Task<ListingDto> GetAnyByIdAsync(int id) =>
        await _context.Listings.Where(l => l.Id == id).Select(ToDto).FirstAsync();

    private static readonly Expression<Func<Listing, ListingDto>> ToDto = l => new ListingDto(
        l.Id,
        l.ProductName,
        l.Category,
        l.UnitPrice,
        l.Unit,
        l.AvailableQuantity,
        l.Location,
        l.FarmerId,
        l.Farmer.FullName,
        l.CreatedAt,
        l.ImageUrl);
}