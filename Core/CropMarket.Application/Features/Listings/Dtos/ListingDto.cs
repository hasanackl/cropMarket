using CropMarket.Domain.Enums;

namespace CropMarket.Application.Features.Listings.Dtos;

public record ListingDto(
    int Id,
    string ProductName,
    string Category,
    decimal UnitPrice,
    Unit Unit,
    decimal AvailableQuantity,
    string Location,
    int FarmerId,
    string FarmerName,
    DateTime CreatedAt);
