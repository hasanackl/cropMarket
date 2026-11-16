using CropMarket.Application.Features.Listings.Dtos;
using CropMarket.Application.Features.Listings.Requests;
using CropMarket.Application.Features.Listings.Results;

namespace CropMarket.Application.Features.Listings;

public interface IListingService
{
    Task<List<ListingDto>> SearchAsync(string? search, string? category, string? location);
    Task<ListingDto?> GetByIdAsync(int id);
    Task<SaveListingResult> CreateAsync(int farmerId, CreateListingRequest request);
    Task<List<MyListingDto>> GetMineAsync(int farmerId);

    // FR-10, FR-12: only the farmer who owns the listing
    Task<EditListingDto?> GetForEditAsync(int farmerId, int id);
    Task<SaveListingResult> UpdateAsync(int farmerId, int id, UpdateListingRequest request);
    Task<SaveListingResult> SetImageAsync(int farmerId, int id, string imageUrl);
}