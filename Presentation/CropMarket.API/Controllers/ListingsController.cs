using System.Security.Claims;
using CropMarket.API.Services;
using CropMarket.Application.Features.Listings;
using CropMarket.Application.Features.Listings.Dtos;
using CropMarket.Application.Features.Listings.Requests;
using CropMarket.Application.Features.Listings.Results;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CropMarket.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ListingsController : ControllerBase
{
    private readonly IListingService _listingService;
    private readonly IImageStorage _imageStorage;

    public ListingsController(IListingService listingService, IImageStorage imageStorage)
    {
        _listingService = listingService;
        _imageStorage = imageStorage;
    }

    // GET /api/listings?search=tomato&category=vegetables&location=İzmir (FR-03)
    [HttpGet]
    public async Task<ActionResult<List<ListingDto>>> Search(
        [FromQuery] string? search, [FromQuery] string? category, [FromQuery] string? location)
    {
        return Ok(await _listingService.SearchAsync(search, category, location));
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
        var result = await _listingService.CreateAsync(GetUserId(), request);

        if (!result.IsSuccess)
        {
            return ToProblem(result, "The listing could not be created.");
        }

        return CreatedAtAction(nameof(GetById), new { id = result.Listing!.Id }, result.Listing);
    }

    // GET /api/listings/mine ("My listings"; farmers only)
    [Authorize(Roles = "Farmer")]
    [HttpGet("mine")]
    public async Task<ActionResult<List<MyListingDto>>> GetMine()
    {
        return Ok(await _listingService.GetMineAsync(GetUserId()));
    }

    // GET /api/listings/5/edit (FR-10): current values for the edit form
    [Authorize(Roles = "Farmer")]
    [HttpGet("{id:int}/edit")]
    public async Task<ActionResult<EditListingDto>> GetForEdit(int id)
    {
        var listing = await _listingService.GetForEditAsync(GetUserId(), id);

        if (listing is null)
        {
            return NotFound();
        }

        return Ok(listing);
    }

    // PUT /api/listings/5 (FR-10)
    [Authorize(Roles = "Farmer")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ListingDto>> Update(int id, UpdateListingRequest request)
    {
        var result = await _listingService.UpdateAsync(GetUserId(), id, request);

        if (!result.IsSuccess)
        {
            return ToProblem(result, "The listing could not be changed.");
        }

        return Ok(result.Listing);
    }

    // PUT /api/listings/5/image (FR-12): multipart/form-data with one file named "image"
    [Authorize(Roles = "Farmer")]
    [HttpPut("{id:int}/image")]
    public async Task<ActionResult<ListingDto>> UploadImage(int id, IFormFile image)
    {
        var farmerId = GetUserId();
        var current = await _listingService.GetForEditAsync(farmerId, id);

        if (current is null)
        {
            return NotFound();
        }

        if (!_imageStorage.IsValid(image))
        {
            return Problem(title: "The photo could not be saved.",
                detail: "The photo must be a JPG, PNG or WEBP file up to 2 MB.",
                statusCode: StatusCodes.Status400BadRequest);
        }

        // Each category gets its own folder, e.g. /uploads/fruits
        var imageUrl = await _imageStorage.SaveAsync(image, current.Category.ToLowerInvariant());
        var result = await _listingService.SetImageAsync(farmerId, id, imageUrl);

        if (!result.IsSuccess)
        {
            _imageStorage.Delete(imageUrl);
            return ToProblem(result, "The photo could not be saved.");
        }

        // The old photo was replaced, so its file is no longer needed
        if (current.ImageUrl is not null)
        {
            _imageStorage.Delete(current.ImageUrl);
        }

        return Ok(result.Listing);
    }

    private ActionResult ToProblem(SaveListingResult result, string title)
    {
        var statusCode = result.Error switch
        {
            SaveListingError.ListingNotFound => StatusCodes.Status404NotFound,
            SaveListingError.StockChanged => StatusCodes.Status409Conflict,
            _ => StatusCodes.Status400BadRequest
        };

        return Problem(title: title, detail: result.Message, statusCode: statusCode);
    }

    // The user id comes from the token, never from the request body
    private int GetUserId() => int.Parse(User.FindFirstValue("sub")!);
}