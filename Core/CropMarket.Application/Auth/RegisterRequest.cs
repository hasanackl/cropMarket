using System.ComponentModel.DataAnnotations;
using CropMarket.Domain.Enums;

namespace CropMarket.Application.Auth;

public record RegisterRequest(
    [Required, MaxLength(100)] string FullName,
    [Required, EmailAddress, MaxLength(150)] string Email,
    [Required, MinLength(8)] string Password,
    [MaxLength(20)] string? PhoneNumber,
    [Required] Role? Role);
