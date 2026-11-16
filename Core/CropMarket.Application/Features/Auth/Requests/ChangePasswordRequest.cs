using System.ComponentModel.DataAnnotations;

namespace CropMarket.Application.Features.Auth.Requests;

// FR-13: same length rule as RegisterRequest
public record ChangePasswordRequest(
    [Required] string CurrentPassword,
    [Required, MinLength(8)] string NewPassword);