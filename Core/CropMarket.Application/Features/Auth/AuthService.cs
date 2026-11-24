using CropMarket.Application.Common.Interfaces;
using CropMarket.Application.Features.Auth.Dtos;
using CropMarket.Application.Features.Auth.Requests;
using CropMarket.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CropMarket.Application.Features.Auth;

public class AuthService : IAuthService
{
    private readonly IAppDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;

    public AuthService(IAppDbContext context, IPasswordHasher passwordHasher, ITokenService tokenService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    public async Task<AuthResponse?> RegisterAsync(RegisterRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        if (await _context.Users.AnyAsync(u => u.Email == email))
        {
            return null;
        }

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = email,
            PasswordHash = _passwordHasher.Hash(request.Password),
            PhoneNumber = request.PhoneNumber?.Trim(),
            Role = request.Role!.Value
        };

        _context.Users.Add(user);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // Two sign-ups with the same email at the same moment (e.g. a double click): both pass the
            // AnyAsync check above, but the unique index on Email lets only one insert through.
            // The second one is "email already registered" (409), not a server error (found by TC34 in Week 6).
            if (await EmailTakenAsync(user, email))
            {
                return null;
            }

            throw;
        }

        return ToResponse(user);
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user is null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            return null;
        }

        return ToResponse(user);
    }

    // FR-13: returns false when the current password is wrong
    public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

        // The current password must be right, so someone at an open session can't take over the account
        if (user is null || !_passwordHasher.Verify(request.CurrentPassword, user.PasswordHash))
        {
            return false;
        }

        user.PasswordHash = _passwordHasher.Hash(request.NewPassword);
        await _context.SaveChangesAsync();

        return true;
    }

    // Called only after a failed insert: forget the new row and check whether the email now exists
    private async Task<bool> EmailTakenAsync(User user, string email)
    {
        _context.Users.Entry(user).State = EntityState.Detached;
        return await _context.Users.AnyAsync(u => u.Email == email);
    }

    private AuthResponse ToResponse(User user)
    {
        var token = _tokenService.CreateToken(user);
        return new AuthResponse(token, user.Id, user.FullName, user.Email, user.Role);
    }
}