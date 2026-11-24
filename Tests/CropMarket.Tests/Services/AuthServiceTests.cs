using CropMarket.Application.Features.Auth;
using CropMarket.Application.Features.Auth.Requests;
using CropMarket.Domain.Enums;
using CropMarket.Infrastructure.Security;
using CropMarket.Tests.Infrastructure;

namespace CropMarket.Tests.Services;

// FR-01 (register / login) and FR-13 (change password)
[Collection(DatabaseCollection.Name)]
public class AuthServiceTests
{
    private const string Password = "Secret123!";
    private readonly TestDatabase _db;

    public AuthServiceTests(TestDatabase db)
    {
        _db = db;
    }

    // The real BCrypt hasher, so the stored hash is the same as in production
    private AuthService CreateService(Persistence.AppDbContext context) =>
        new(context, new PasswordHasher(), new FakeTokenService());

    private static string NewEmail() => $"user-{Guid.NewGuid():N}@test.local";

    private async Task<string> RegisterConsumerAsync()
    {
        var email = NewEmail();
        await using var context = _db.CreateContext();
        var response = await CreateService(context)
            .RegisterAsync(new RegisterRequest("Test Consumer", email, Password, null, Role.Consumer));

        Assert.NotNull(response);
        return email;
    }

    [Fact]
    public async Task TC01_Login_with_wrong_password_is_rejected()
    {
        var email = await RegisterConsumerAsync();
        await using var context = _db.CreateContext();

        var response = await CreateService(context).LoginAsync(new LoginRequest(email, "WrongPass1!"));

        Assert.Null(response);
    }

    [Fact]
    public async Task TC02_Register_with_an_existing_email_in_other_letter_case_is_rejected()
    {
        var email = await RegisterConsumerAsync();
        await using var context = _db.CreateContext();

        var response = await CreateService(context)
            .RegisterAsync(new RegisterRequest("Copy", email.ToUpperInvariant(), Password, null, Role.Farmer));

        Assert.Null(response);
    }

    [Fact]
    public async Task TC03_Login_ignores_email_letter_case_and_returns_a_token()
    {
        var email = await RegisterConsumerAsync();
        await using var context = _db.CreateContext();

        var response = await CreateService(context).LoginAsync(new LoginRequest(email.ToUpperInvariant(), Password));

        Assert.NotNull(response);
        Assert.False(string.IsNullOrEmpty(response.Token));
        Assert.Equal(Role.Consumer, response.Role);
    }

    [Fact]
    public async Task TC04_Change_password_with_wrong_current_password_keeps_the_old_password()
    {
        var email = await RegisterConsumerAsync();
        await using var context = _db.CreateContext();
        var service = CreateService(context);
        var user = context.Users.Single(u => u.Email == email);

        var changed = await service.ChangePasswordAsync(user.Id, new ChangePasswordRequest("WrongPass1!", "NewSecret456!"));

        Assert.False(changed);
        Assert.NotNull(await service.LoginAsync(new LoginRequest(email, Password)));
    }

    [Fact]
    public async Task TC05_Change_password_replaces_the_old_password()
    {
        var email = await RegisterConsumerAsync();
        await using var context = _db.CreateContext();
        var service = CreateService(context);
        var user = context.Users.Single(u => u.Email == email);

        var changed = await service.ChangePasswordAsync(user.Id, new ChangePasswordRequest(Password, "NewSecret456!"));

        Assert.True(changed);
        Assert.Null(await service.LoginAsync(new LoginRequest(email, Password)));
        Assert.NotNull(await service.LoginAsync(new LoginRequest(email, "NewSecret456!")));
    }
}