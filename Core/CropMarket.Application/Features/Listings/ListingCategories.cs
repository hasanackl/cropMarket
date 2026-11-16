namespace CropMarket.Application.Features.Listings;

// The fixed category list; the same names are used by the web app (categoryChips.ts)
public static class ListingCategories
{
    public static readonly string[] All = ["vegetables", "fruits", "grains", "oilOlives", "dairyEggs"];

    // Returns the official spelling, or null when the category is unknown
    public static string? Normalize(string category) =>
        All.FirstOrDefault(c => c.Equals(category.Trim(), StringComparison.OrdinalIgnoreCase));
}