namespace CropMarket.API.Services;

// Saving files is a web-server job (wwwroot), so it lives in the API project
public interface IImageStorage
{
    bool IsValid(IFormFile image);
    Task<string> SaveAsync(IFormFile image, string subfolder);
    void Delete(string imageUrl);
}