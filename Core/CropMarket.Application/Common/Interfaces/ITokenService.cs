using CropMarket.Domain.Entities;

namespace CropMarket.Application.Common.Interfaces;

public interface ITokenService
{
    string CreateToken(User user);
}
