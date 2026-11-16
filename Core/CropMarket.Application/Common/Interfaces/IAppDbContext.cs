using CropMarket.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CropMarket.Application.Common.Interfaces;

// The services in Features use this interface instead of the concrete AppDbContext,
// so the Application layer does not depend on the Persistence project (onion rule).
public interface IAppDbContext
{
    DbSet<User> Users { get; }
    DbSet<Listing> Listings { get; }
    DbSet<Order> Orders { get; }
    DbSet<City> Cities { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}