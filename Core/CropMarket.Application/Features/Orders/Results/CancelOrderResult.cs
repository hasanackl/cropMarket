using CropMarket.Application.Features.Orders.Dtos;

namespace CropMarket.Application.Features.Orders.Results;

public class CancelOrderResult
{
    public MyOrderDto? Order { get; }
    public CancelOrderError? Error { get; }
    public string? Message { get; }

    public bool IsSuccess => Error is null;

    private CancelOrderResult(MyOrderDto? order, CancelOrderError? error, string? message)
    {
        Order = order;
        Error = error;
        Message = message;
    }

    public static CancelOrderResult Success(MyOrderDto order) => new(order, null, null);

    public static CancelOrderResult Failure(CancelOrderError error, string message) => new(null, error, message);
}