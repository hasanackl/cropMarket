using System.ComponentModel.DataAnnotations;

namespace CropMarket.Application.Auth;

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required] string Password);
