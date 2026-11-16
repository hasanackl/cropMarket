namespace CropMarket.Application.Features.Orders.Results;

public enum CreateOrderError
{
    ListingNotFound,
    InvalidQuantity,
    InsufficientStock,
    StockChanged
}
