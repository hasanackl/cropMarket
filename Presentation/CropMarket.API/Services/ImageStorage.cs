namespace CropMarket.API.Services;

public class ImageStorage : IImageStorage
{
    private const long MaxSizeInBytes = 2 * 1024 * 1024;
    private static readonly string[] AllowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

    private readonly string _webRoot;

    public ImageStorage(IWebHostEnvironment environment)
    {
        // WebRootPath is null when the wwwroot folder does not exist yet
        _webRoot = environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot");
    }

    // FR-12: JPG, PNG or WEBP, at most 2 MB
    public bool IsValid(IFormFile image)
    {
        var extension = Path.GetExtension(image.FileName).ToLowerInvariant();

        return image.Length > 0
            && image.Length <= MaxSizeInBytes
            && AllowedExtensions.Contains(extension);
    }

    public async Task<string> SaveAsync(IFormFile image, string subfolder)
    {
        // Never use the user's file name: a new unique name prevents overwrites and path tricks
        var extension = Path.GetExtension(image.FileName).ToLowerInvariant();
        var fileName = $"{Guid.NewGuid()}{extension}";

        var folder = Path.Combine(_webRoot, "uploads", subfolder);
        Directory.CreateDirectory(folder);

        await using var stream = File.Create(Path.Combine(folder, fileName));
        await image.CopyToAsync(stream);

        return $"/uploads/{subfolder}/{fileName}";
    }

    public void Delete(string imageUrl)
    {
        // Only files inside /uploads are ever deleted
        if (!imageUrl.StartsWith("/uploads/"))
        {
            return;
        }

        var path = Path.Combine(_webRoot, imageUrl.TrimStart('/'));
        if (File.Exists(path))
        {
            File.Delete(path);
        }
    }
}