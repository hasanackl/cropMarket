using System.Linq.Expressions;
using CropMarket.Application.Listings;
using CropMarket.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CropMarket.Persistence.Services;

public class ListingService : IListingService
{
    private readonly AppDbContext _context;

    public ListingService(AppDbContext context)
    {
        _context = context;
    }

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

    public async Task<ListingDto> CreateAsync(int farmerId, CreateListingRequest request)
    {
        var listing = new Listing
        {
            FarmerId = farmerId,
            ProductName = request.ProductName.Trim(),
            Category = request.Category.Trim(),
            UnitPrice = request.UnitPrice,
            Unit = request.Unit!.Value,
            AvailableQuantity = request.AvailableQuantity,
            Location = request.Location.Trim()
        };

        _context.Listings.Add(listing);
        await _context.SaveChangesAsync();

        // Read it back so the DTO includes the farmer's name
        return (await GetByIdAsync(listing.Id))!;
    }

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
        l.CreatedAt);
}
