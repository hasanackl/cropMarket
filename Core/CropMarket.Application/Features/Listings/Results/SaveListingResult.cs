using CropMarket.Application.Features.Listings.Dtos;

namespace CropMarket.Application.Features.Listings.Results;

// Used by create, update and photo upload, which can fail for the same reasons
public class SaveListingResult
{
    public ListingDto? Listing { get; }
    public SaveListingError? Error { get; }
    public string? Message { get; }

    public bool IsSuccess => Error is null;

    private SaveListingResult(ListingDto? listing, SaveListingError? error, string? message)
    {
        Listing = listing;
        Error = error;
        Message = message;
    }

    public static SaveListingResult Success(ListingDto listing) => new(listing, null, null);

    public static SaveListingResult Failure(SaveListingError error, string message) => new(null, error, message);
}