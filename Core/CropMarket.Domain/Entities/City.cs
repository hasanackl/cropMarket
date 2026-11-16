namespace CropMarket.Domain.Entities;

// The cities a farmer can choose for a listing (FR-11).
// Listing.Location keeps the city name as text, so old listings stay valid.
public class City
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}