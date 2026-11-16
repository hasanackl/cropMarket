using System.Text.Json.Serialization;
using CropMarket.API.ErrorHandling;
using CropMarket.API.Extensions;
using CropMarket.API.Services;
using CropMarket.Application;
using CropMarket.Infrastructure;
using CropMarket.Persistence;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Enums are sent as camelCase text ("farmer", "kg"); numbers are rejected
builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase, allowIntegerValues: false)));

builder.Services.AddApplication();
builder.Services.AddPersistence(builder.Configuration.GetConnectionString("DefaultConnection")!);
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddSwaggerWithJwt();
builder.Services.AddScoped<IImageStorage, ImageStorage>();

// Every error answer uses the same ProblemDetails JSON (RFC 9457)
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

// Allow the React app to call the API (risk R2); the address comes from appsettings.json
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()));

var app = builder.Build();

// First in the pipeline, so it also catches errors from the middleware after it
app.UseExceptionHandler();
// Empty 401/403/404 answers also get a ProblemDetails body
app.UseStatusCodePages();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Serves the uploaded listing photos from wwwroot/uploads (FR-12)
app.UseStaticFiles();
app.UseCors("Frontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();