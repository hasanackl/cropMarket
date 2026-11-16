using System.ComponentModel.DataAnnotations;

namespace CropMarket.Application.Features.Orders.Requests;

// The consumer can change the amount (only while Pending) and the delivery address
public record UpdateOrderRequest(
    decimal Quantity,
    [Required, MaxLength(250)] string DeliveryAddress);