using System.ComponentModel.DataAnnotations;
using CropMarket.Domain.Enums;

namespace CropMarket.Application.Features.Listings.Requests;

// FR-10: the farmer can change every field of an own listing
public record UpdateListingRequest(
    [Required, MaxLength(100)] string ProductName,
    [Required, MaxLength(50)] string Category,
    [Range(0.01, 100000)] decimal UnitPrice,
    [Required] Unit? Unit,
    [Range(0.01, 100000)] decimal AvailableQuantity,
    [Required, MaxLength(100)] string Location);