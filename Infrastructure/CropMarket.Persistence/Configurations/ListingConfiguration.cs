using CropMarket.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CropMarket.Persistence.Configurations;

public class ListingConfiguration : IEntityTypeConfiguration<Listing>
{
    public void Configure(EntityTypeBuilder<Listing> builder)
    {
        builder.Property(l => l.ProductName).HasMaxLength(100);
        builder.Property(l => l.Category).HasMaxLength(50);
        builder.Property(l => l.UnitPrice).HasPrecision(10, 2);
        builder.Property(l => l.Unit).HasConversion<string>().HasMaxLength(10);
        builder.Property(l => l.AvailableQuantity).HasPrecision(10, 2);
        builder.Property(l => l.Location).HasMaxLength(100);
        builder.Property(l => l.RowVersion).IsRowVersion();

        builder.HasOne(l => l.Farmer)
            .WithMany(u => u.Listings)
            .HasForeignKey(l => l.FarmerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
