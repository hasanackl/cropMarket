using CropMarket.Domain.Enums;

namespace CropMarket.Application.Features.Listings.Dtos;

// What a farmer sees on the "My listings" page; sold-out (inactive) listings are included
public record MyListingDto(
    int Id,
    string ProductName,
    string Category,
    decimal UnitPrice,
    Unit Unit,
    decimal AvailableQuantity,
    string Location,
    bool IsActive,
    int OrderCount,
    DateTime CreatedAt);
