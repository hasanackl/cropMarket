using CropMarket.Application.Features.Auth;
using CropMarket.Application.Features.Listings;
using CropMarket.Application.Features.Orders;
using Microsoft.Extensions.DependencyInjection;

namespace CropMarket.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IListingService, ListingService>();
        services.AddScoped<IOrderService, OrderService>();

        return services;
    }
}
