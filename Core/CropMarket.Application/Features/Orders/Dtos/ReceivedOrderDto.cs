using CropMarket.Domain.Enums;

namespace CropMarket.Application.Features.Orders.Dtos;

// What a farmer sees on the "Received orders" page.
// The phone number helps the farmer arrange the delivery (cash on delivery).
public record ReceivedOrderDto(
    int Id,
    int ListingId,
    string ProductName,
    string Category,
    string ConsumerName,
    string? ConsumerPhone,
    decimal Quantity,
    Unit Unit,
    decimal TotalPrice,
    OrderStatus Status,
    string DeliveryAddress,
    DateTime CreatedAt);
