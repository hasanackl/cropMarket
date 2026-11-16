using CropMarket.Domain.Common;
using CropMarket.Domain.Enums;

namespace CropMarket.Domain.Entities;

public class Order : BaseEntity
{
    public int ListingId { get; set; }
    public Listing Listing { get; set; } = null!;

    public int ConsumerId { get; set; }
    public User Consumer { get; set; } = null!;

    public decimal Quantity { get; set; }

    // The price is copied at order time, so a later price change does not alter old orders
    public decimal UnitPriceAtOrder { get; set; }
    public decimal TotalPrice { get; set; }

    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.CashOnDelivery;
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public string DeliveryAddress { get; set; } = string.Empty;

    // False until the farmer opens the notifications; drives the bell counter
    public bool IsSeenByFarmer { get; set; }
}