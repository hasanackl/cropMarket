using System.Security.Claims;
using CropMarket.Application.Listings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CropMarket.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ListingsController : ControllerBase
{
    private readonly IListingService _listingService;

    public ListingsController(IListingService listingService)
    {
        _listingService = listingService;
    }

    // GET /api/listings?search=tomato&category=Vegetables&location=Izmir (FR-03)
    [HttpGet]
    public async Task<ActionResult<List<ListingDto>>> Search(
        [FromQuery] string? search, [FromQuery] string? category, [FromQuery] string? location)
    {
        var listings = await _listingService.SearchAsync(search, category, location);
        return Ok(listings);
    }

    // GET /api/listings/5 (FR-03)
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ListingDto>> GetById(int id)
    {
        var listing = await _listingService.GetByIdAsync(id);

        if (listing is null)
        {
            return NotFound();
        }

        return Ok(listing);
    }

    // POST /api/listings (FR-02, NFR-03: farmers only)
    [Authorize(Roles = "Farmer")]
    [HttpPost]
    public async Task<ActionResult<ListingDto>> Create(CreateListingRequest request)
    {
        // The farmer id comes from the token, not from the form
        var farmerId = int.Parse(User.FindFirstValue("sub")!);
        var listing = await _listingService.CreateAsync(farmerId, request);

        return CreatedAtAction(nameof(GetById), new { id = listing.Id }, listing);
    }
}
