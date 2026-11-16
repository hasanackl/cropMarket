using CropMarket.Application.Features.Cities.Dtos;

namespace CropMarket.Application.Features.Cities;

public interface ICityService
{
    Task<List<CityDto>> GetAllAsync();
}