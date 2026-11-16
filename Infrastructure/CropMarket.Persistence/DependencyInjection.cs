using CropMarket.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace CropMarket.Persistence;

public static class DependencyInjection
{
    public static IServiceCollection AddPersistence(this IServiceCollection services, string connectionString)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(connectionString));

        // The services ask for IAppDbContext; they get the same scoped AppDbContext
        services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());

        return services;
    }
}
