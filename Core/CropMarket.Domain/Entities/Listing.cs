using CropMarket.Domain.Common;
using CropMarket.Domain.Enums;

namespace CropMarket.Domain.Entities;

public class Listing : BaseEntity
{
    public int FarmerId { get; set; }
    public User Farmer { get; set; } = null!;

    public string ProductName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public Unit Unit { get; set; }
    public decimal AvailableQuantity { get; set; }
    public string Location { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    // Concurrency token for the stock update in Week 5 (ADR-02)
    public byte[] RowVersion { get; set; } = [];
}
