using CropMarket.Domain.Enums;

namespace CropMarket.Application.Auth;

public record AuthResponse(string Token, int Id, string FullName, string Email, Role Role);
