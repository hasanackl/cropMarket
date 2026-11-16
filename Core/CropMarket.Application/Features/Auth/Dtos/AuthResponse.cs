using CropMarket.Domain.Enums;

namespace CropMarket.Application.Features.Auth.Dtos;

public record AuthResponse(string Token, int Id, string FullName, string Email, Role Role);
