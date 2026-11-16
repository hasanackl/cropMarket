using System.ComponentModel.DataAnnotations;
using CropMarket.Domain.Enums;

namespace CropMarket.Application.Features.Orders.Requests;

// Nullable + [Required]: a missing status is rejected with 400 instead of becoming "Pending" (the default 0)
public record UpdateOrderStatusRequest([Required] OrderStatus? Status);
