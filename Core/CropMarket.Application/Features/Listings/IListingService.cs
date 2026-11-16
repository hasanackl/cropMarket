using CropMarket.Application.Features.Listings.Dtos;
using CropMarket.Application.Features.Listings.Requests;

namespace CropMarket.Application.Features.Listings;

public interface IListingService
{
    Task<List<ListingDto>> SearchAsync(string? search, string? category, string? location);
    Task<ListingDto?> GetByIdAsync(int id);
    Task<ListingDto> CreateAsync(int farmerId, CreateListingRequest request);
}
