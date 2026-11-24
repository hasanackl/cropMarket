using CropMarket.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CropMarket.Tests.Infrastructure;

// One real SQL Server LocalDB database for all tests, separate from the development database.
// LocalDB is used instead of the EF Core InMemory provider because the InMemory provider does not
// generate RowVersion values and does not translate ToLower() like SQL Server, so the concurrency
// rule (ADR-02) and the search could not be tested realistically.
public class TestDatabase : IDisposable
{
    public const string DefaultConnectionString =
        "Server=(localdb)\\MSSQLLocalDB;Database=CropMarketTestDb;Trusted_Connection=True;TrustServerCertificate=True";

    public string ConnectionString { get; } =
        Environment.GetEnvironmentVariable("CROPMARKET_TEST_DB") ?? DefaultConnectionString;

    public TestDatabase()
    {
        // A fresh database for every test run: same migrations as production, including the 81 cities
        using var context = CreateContext();
        context.Database.EnsureDeleted();
        context.Database.Migrate();
    }

    public AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(ConnectionString)
            .Options;

        return new AppDbContext(options);
    }

    public void Dispose()
    {
        // The database is kept after the run, so the data can be inspected in SQL Server Object Explorer
    }
}

// All test classes that use the database run one after another, never in parallel
[CollectionDefinition(Name)]
public class DatabaseCollection : ICollectionFixture<TestDatabase>
{
    public const string Name = "Database";
}