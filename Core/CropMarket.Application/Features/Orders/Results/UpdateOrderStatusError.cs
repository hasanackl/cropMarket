namespace CropMarket.Application.Features.Orders.Results;

public enum UpdateOrderStatusError
{
    OrderNotFound,
    NotYourOrder,
    InvalidTransition
}