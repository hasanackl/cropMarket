using System.ComponentModel.DataAnnotations;

namespace CropMarket.Application.Features.Auth.Requests;

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required] string Password);
