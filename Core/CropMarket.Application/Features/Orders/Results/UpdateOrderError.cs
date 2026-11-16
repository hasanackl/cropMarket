namespace CropMarket.Application.Features.Orders.Results;

public enum UpdateOrderError
{
    OrderNotFound,
    OrderClosed,
    QuantityLocked,
    InvalidQuantity,
    InsufficientStock,
    StockChanged
}