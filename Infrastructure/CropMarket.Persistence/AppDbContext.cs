using CropMarket.Application.Common.Interfaces;
using CropMarket.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CropMarket.Persistence;

public class AppDbContext : DbContext, IAppDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Listing> Listings { get; set; } = null!;
    public DbSet<Order> Orders { get; set; } = null!;
    public DbSet<City> Cities { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Reads every IEntityTypeConfiguration class in the Configurations folder
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}