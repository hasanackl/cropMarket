using CropMarket.Domain.Entities;

namespace CropMarket.Application.Auth;

public interface ITokenService
{
    string CreateToken(User user);
}
