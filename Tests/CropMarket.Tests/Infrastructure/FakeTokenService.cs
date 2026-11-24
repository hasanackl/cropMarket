using CropMarket.Application.Common.Interfaces;
using CropMarket.Domain.Entities;

namespace CropMarket.Tests.Infrastructure;

// AuthService only needs "a token"; the real JWT is tested through the API tests
public class FakeTokenService : ITokenService
{
    public string CreateToken(User user) => $"token-for-{user.Id}";
}