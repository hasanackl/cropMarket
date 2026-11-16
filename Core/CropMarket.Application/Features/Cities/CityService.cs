using CropMarket.Application.Common.Interfaces;
using CropMarket.Application.Features.Cities.Dtos;
using Microsoft.EntityFrameworkCore;

namespace CropMarket.Application.Features.Cities;

public class CityService : ICityService
{
    private readonly IAppDbContext _context;

    public CityService(IAppDbContext context)
    {
        _context = context;
    }

    // FR-11: the city list comes from the database, not from the web app
    public async Task<List<CityDto>> GetAllAsync()
    {
        return await _context.Cities
            .OrderBy(c => c.Name)
            .Select(c => new CityDto(c.Id, c.Name))
            .ToListAsync();
    }
}