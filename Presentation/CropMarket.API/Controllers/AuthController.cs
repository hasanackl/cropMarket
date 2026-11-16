using CropMarket.API.Extensions;
using CropMarket.Application.Features.Auth;
using CropMarket.Application.Features.Auth.Dtos;
using CropMarket.Application.Features.Auth.Requests;
using Microsoft.AspNetCore.Authorization;
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
            return Problem(title: "The account could not be created.",
                detail: "This email is already registered.",
                statusCode: StatusCodes.Status409Conflict);
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
            return Problem(title: "Login failed.",
                detail: "Email or password is incorrect.",
                statusCode: StatusCodes.Status401Unauthorized);
        }

        return Ok(response);
    }

    // POST /api/auth/change-password (FR-13; any logged-in user)
    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
    {
        var isChanged = await _authService.ChangePasswordAsync(User.GetUserId(), request);

        // 400, not 401: a wrong password here must not log the user out
        if (!isChanged)
        {
            return Problem(title: "The password could not be changed.",
                detail: "Current password is incorrect.",
                statusCode: StatusCodes.Status400BadRequest);
        }

        return NoContent();
    }
}