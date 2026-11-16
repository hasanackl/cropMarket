using System.Security.Claims;

namespace CropMarket.API.Extensions;

public static class ClaimsPrincipalExtensions
{
    // Every controller needs the logged-in user's id; it comes from the token's "sub" claim,
    // never from the request body. One place instead of a copy in every controller.
    public static int GetUserId(this ClaimsPrincipal user) =>
        int.Parse(user.FindFirstValue("sub")!);
}