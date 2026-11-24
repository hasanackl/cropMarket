using System.Diagnostics;
using System.Net.Http.Json;
using CropMarket.Application.Features.Listings.Dtos;
using CropMarket.Domain.Entities;
using CropMarket.Domain.Enums;
using CropMarket.Tests.Infrastructure;
using Xunit.Abstractions;

namespace CropMarket.Tests.Performance;

// NFR-01: a search answers in less than 2 seconds.
// 1,000 extra active listings are added, then each search is sent 20 times through the API.
// The API runs in memory, so network time is not included (see the report's limitations).
[Collection(DatabaseCollection.Name)]
public class SearchPerformanceTests
{
    private const int ListingCount = 1000;
    private const int Repeats = 20;
    private const double LimitMs = 2000;

    private readonly TestDatabase _db;
    private readonly ApiFactory _factory;
    private readonly ITestOutputHelper _output;

    public SearchPerformanceTests(TestDatabase db, ApiFactory factory, ITestOutputHelper output)
    {
        _db = db;
        _factory = factory;
        _output = output;
    }

    [Fact]
    public async Task TC32_Search_answers_in_less_than_two_seconds_with_1000_listings()
    {
        await SeedListingsAsync();
        var client = _factory.CreateClient();
        await client.GetAsync("/api/listings"); // warm-up: the first call also starts EF Core

        var lines = new List<string> { $"NFR-01 search timing, {ListingCount} seeded listings, {Repeats} requests each, {DateTime.Now:yyyy-MM-dd HH:mm}" };
        foreach (var url in new[] { "/api/listings", "/api/listings?search=tomato", "/api/listings?category=fruits&location=Manisa" })
        {
            var times = new List<double>();
            var rows = 0;
            for (var i = 0; i < Repeats; i++)
            {
                var watch = Stopwatch.StartNew();
                var result = await client.GetFromJsonAsync<List<ListingDto>>(url, ApiClient.Json);
                watch.Stop();
                times.Add(watch.Elapsed.TotalMilliseconds);
                rows = result!.Count;
            }

            times.Sort();
            var p95 = times[(int)Math.Ceiling(0.95 * times.Count) - 1];
            var line = $"{url} -> rows {rows}, avg {times.Average():0.0} ms, p95 {p95:0.0} ms, max {times.Max():0.0} ms";
            lines.Add(line);
            _output.WriteLine(line);

            Assert.True(p95 < LimitMs, $"{url}: p95 {p95:0} ms is not below {LimitMs} ms");
        }

        // Kept as evidence for the report
        var file = Path.Combine(AppContext.BaseDirectory, "nfr01-search-timing.txt");
        await File.WriteAllLinesAsync(file, lines);
        _output.WriteLine("Saved: " + file);
    }

    private async Task SeedListingsAsync()
    {
        await using var context = _db.CreateContext();
        var farmer = await TestData.AddUserAsync(context, Role.Farmer);
        string[] products = ["Tomato", "Cucumber", "Apple", "Wheat", "Olive", "Cheese", "Pepper", "Grape"];
        string[] categories = ["vegetables", "vegetables", "fruits", "grains", "oilOlives", "dairyEggs", "vegetables", "fruits"];
        string[] cities = ["Manisa", "İzmir", "Antalya", "Bursa", "Konya"];

        for (var i = 0; i < ListingCount; i++)
        {
            context.Listings.Add(new Listing
            {
                FarmerId = farmer.Id,
                ProductName = $"{products[i % products.Length]} {i}",
                Category = categories[i % categories.Length],
                UnitPrice = 10 + i % 40,
                Unit = Unit.Kg,
                AvailableQuantity = 100,
                Location = cities[i % cities.Length]
            });
        }

        await context.SaveChangesAsync();
    }
}