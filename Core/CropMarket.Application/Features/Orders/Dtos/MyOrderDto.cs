using CropMarket.Domain.Enums;

namespace CropMarket.Application.Features.Orders.Dtos;

// What a consumer sees on the "My orders" page
public record MyOrderDto(
    int Id,
    int ListingId,
    string ProductName,
    string Category,
    string FarmerName,
    decimal Quantity,
    Unit Unit,
    decimal TotalPrice,
    PaymentMethod PaymentMethod,
    OrderStatus Status,
    string DeliveryAddress,
    DateTime CreatedAt);
