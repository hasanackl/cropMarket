using CropMarket.Application.Auth;
using Microsoft.AspNetCore.Mvc;

namespace CropMarket.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    // POST /api/auth/register (FR-01)
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var response = await _authService.RegisterAsync(request);

        if (response is null)
        {
            return Conflict(new { message = "This email is already registered." });
        }

        return Ok(response);
    }

    // POST /api/auth/login (FR-01)
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var response = await _authService.LoginAsync(request);

        if (response is null)
        {
            return Unauthorized(new { message = "Email or password is incorrect." });
        }

        return Ok(response);
    }
}
