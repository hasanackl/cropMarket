using System.Security.Claims;
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

    // POST /api/auth/change-password (FR-13; any logged-in user)
    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
    {
        var userId = int.Parse(User.FindFirstValue("sub")!);
        var isChanged = await _authService.ChangePasswordAsync(userId, request);

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