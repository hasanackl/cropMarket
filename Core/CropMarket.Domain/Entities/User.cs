using CropMarket.Domain.Common;
using CropMarket.Domain.Enums;

namespace CropMarket.Domain.Entities;

public class User : BaseEntity
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public Role Role { get; set; }

    public ICollection<Listing> Listings { get; set; } = [];
}
