using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace CropMarket.Tests.Infrastructure;

// Starts the real API in memory (same Program.cs, middleware, JWT and controllers)
// against the test database. No browser and no network port are needed.
public class ApiFactory : WebApplicationFactory<Program>
{
    // Only for tests; the real key stays in user-secrets
    public const string TestJwtKey = "test-only-key-for-cropmarket-integration-tests-0123456789";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // "Testing" instead of "Development": user-secrets are not loaded, so the test settings below win
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:DefaultConnection", TestDatabase.ConnectionString);
        builder.UseSetting("Jwt:Key", TestJwtKey);
    }
}