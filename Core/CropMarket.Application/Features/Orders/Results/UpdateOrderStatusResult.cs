using CropMarket.Application.Features.Orders.Dtos;

namespace CropMarket.Application.Features.Orders.Results;

public class UpdateOrderStatusResult
{
    public ReceivedOrderDto? Order { get; }
    public UpdateOrderStatusError? Error { get; }
    public string? Message { get; }

    public bool IsSuccess => Error is null;

    private UpdateOrderStatusResult(ReceivedOrderDto? order, UpdateOrderStatusError? error, string? message)
    {
        Order = order;
        Error = error;
        Message = message;
    }

    public static UpdateOrderStatusResult Success(ReceivedOrderDto order) => new(order, null, null);

    public static UpdateOrderStatusResult Failure(UpdateOrderStatusError error, string message) => new(null, error, message);
}