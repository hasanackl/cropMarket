using CropMarket.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CropMarket.Persistence.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.Property(o => o.Quantity).HasPrecision(10, 2);
        builder.Property(o => o.UnitPriceAtOrder).HasPrecision(10, 2);
        builder.Property(o => o.TotalPrice).HasPrecision(12, 2);
        builder.Property(o => o.PaymentMethod).HasConversion<string>().HasMaxLength(20);
        builder.Property(o => o.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(o => o.DeliveryAddress).HasMaxLength(250);

        // Restrict: a listing or user that has orders cannot be deleted, so order history is kept.
        // It also avoids two cascade paths from User to Order, which SQL Server does not allow.
        builder.HasOne(o => o.Listing)
            .WithMany(l => l.Orders)
            .HasForeignKey(o => o.ListingId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(o => o.Consumer)
            .WithMany(u => u.Orders)
            .HasForeignKey(o => o.ConsumerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}