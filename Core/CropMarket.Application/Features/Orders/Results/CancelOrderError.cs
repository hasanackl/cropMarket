namespace CropMarket.Application.Features.Orders.Results;

public enum CancelOrderError
{
    OrderNotFound,
    NotPending,
    StockChanged
}