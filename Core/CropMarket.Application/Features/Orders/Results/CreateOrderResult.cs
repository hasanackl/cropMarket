using CropMarket.Application.Features.Orders.Dtos;

namespace CropMarket.Application.Features.Orders.Results;

// The service returns either the created order or an error with a message.
// The controller decides the HTTP status code; the service knows nothing about HTTP.
public class CreateOrderResult
{
    public OrderDto? Order { get; }
    public CreateOrderError? Error { get; }
    public string? Message { get; }

    public bool IsSuccess => Error is null;

    private CreateOrderResult(OrderDto? order, CreateOrderError? error, string? message)
    {
        Order = order;
        Error = error;
        Message = message;
    }

    public static CreateOrderResult Success(OrderDto order) => new(order, null, null);

    public static CreateOrderResult Failure(CreateOrderError error, string message) => new(null, error, message);
}
