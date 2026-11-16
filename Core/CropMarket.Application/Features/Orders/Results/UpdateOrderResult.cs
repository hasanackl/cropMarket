using CropMarket.Application.Features.Orders.Dtos;

namespace CropMarket.Application.Features.Orders.Results;

public class UpdateOrderResult
{
    public MyOrderDto? Order { get; }
    public UpdateOrderError? Error { get; }
    public string? Message { get; }

    public bool IsSuccess => Error is null;

    private UpdateOrderResult(MyOrderDto? order, UpdateOrderError? error, string? message)
    {
        Order = order;
        Error = error;
        Message = message;
    }

    public static UpdateOrderResult Success(MyOrderDto order) => new(order, null, null);

    public static UpdateOrderResult Failure(UpdateOrderError error, string message) => new(null, error, message);
}