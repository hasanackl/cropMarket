namespace CropMarket.Application.Features.Listings.Results;

public enum SaveListingError
{
    ListingNotFound,
    InvalidCategory,
    InvalidCity,
    UnitLocked,
    StockChanged
}