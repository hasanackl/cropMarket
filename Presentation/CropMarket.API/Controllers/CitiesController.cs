using CropMarket.Application.Features.Cities;
using CropMarket.Application.Features.Cities.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace CropMarket.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CitiesController : ControllerBase
{
    private readonly ICityService _cityService;

    public CitiesController(ICityService cityService)
    {
        _cityService = cityService;
    }

    // GET /api/cities (FR-11; public, the search bar also needs it)
    [HttpGet]
    public async Task<ActionResult<List<CityDto>>> GetAll()
    {
        return Ok(await _cityService.GetAllAsync());
    }
}