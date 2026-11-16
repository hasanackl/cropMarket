using System.ComponentModel.DataAnnotations;

namespace CropMarket.Application.Features.Orders.Requests;

// Quantity has no [Range] on purpose: OrderService checks it against the stock
// and returns a clear message (NFR-02).
public record CreateOrderRequest(
    [Range(1, int.MaxValue)] int ListingId,
    decimal Quantity,
    [Required, MaxLength(250)] string DeliveryAddress);
