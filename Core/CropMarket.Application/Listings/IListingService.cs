namespace CropMarket.Application.Listings;

public interface IListingService
{
    Task<List<ListingDto>> SearchAsync(string? search, string? category, string? location);
    Task<ListingDto?> GetByIdAsync(int id);
    Task<ListingDto> CreateAsync(int farmerId, CreateListingRequest request);
}
