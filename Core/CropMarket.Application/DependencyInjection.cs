using CropMarket.Application.Features.Auth;
using CropMarket.Application.Features.Listings;
using Microsoft.Extensions.DependencyInjection;

namespace CropMarket.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IListingService, ListingService>();

        return services;
    }
}
