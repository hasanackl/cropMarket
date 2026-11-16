using CropMarket.Domain.Enums;

namespace CropMarket.Application.Features.Listings.Dtos;

// The current values that fill the edit form (FR-10)
public record EditListingDto(
    int Id,
    string ProductName,
    string Category,
    decimal UnitPrice,
    Unit Unit,
    decimal AvailableQuantity,
    string Location,
    string? ImageUrl,
    bool HasOrders);