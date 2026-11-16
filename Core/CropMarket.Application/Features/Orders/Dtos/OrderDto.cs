using CropMarket.Domain.Enums;

namespace CropMarket.Application.Features.Orders.Dtos;

public record OrderDto(
    int Id,
    int ListingId,
    string ProductName,
    decimal Quantity,
    Unit Unit,
    decimal UnitPriceAtOrder,
    decimal TotalPrice,
    PaymentMethod PaymentMethod,
    OrderStatus Status,
    string DeliveryAddress,
    decimal RemainingQuantity,
    DateTime CreatedAt);
