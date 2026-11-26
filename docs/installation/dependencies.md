# Dependencies and Tested Environment

This file lists everything needed to build, run and test CropMarket, with the versions that were **actually tested** (not simply the newest versions).
The values were collected on 26 November 2026 with a script on the development computer (branch `docs/week7-installation`, commit `5ec9865`).

## 1. Tested environment

| Item | Version tested | Notes |
|---|---|---|
| Operating system | Windows 11 Pro 10.0.26200, 64-bit | LocalDB runs only on Windows (see section 5) |
| Hardware | Intel Core i7-11800H, 16 GB RAM | No special hardware is needed |
| Git | 2.45.1 | Used to clone the repository |
| IDE (optional) | Visual Studio Community 2026 18.10.3 | Not required; the command line is enough |

## 2. Tools that must be installed

| Tool | Version tested | Minimum | Purpose | Pinned in |
|---|---|---|---|---|
| .NET SDK | 10.0.401 (runtime 10.0.12) | 10.0.401 | Build, run and test the API | `global.json` |
| dotnet-ef (EF Core CLI) | 10.0.14 | same as EF Core packages | Create the database from the migrations | `dotnet-tools.json` (repository root) |
| SQL Server LocalDB | SQL Server 2025 (17.0.4025.3), instance `MSSQLLocalDB` | any LocalDB 2019 or newer | Database for the API and the tests | – |
| Node.js | 22.20.0 | 22.12 | Build and run the React client | `.nvmrc`, `package.json` engines |
| npm | 10.9.3 | comes with Node.js | Install the web packages | `package-lock.json` |

## 3. Backend packages (NuGet)

All projects target `net10.0`. The exact versions are fixed in the `.csproj` files and are restored with `dotnet restore`.

| Project | Package | Version |
|---|---|---|
| CropMarket.Domain | – | – |
| CropMarket.Application | Microsoft.EntityFrameworkCore | 10.0.14 |
| CropMarket.Infrastructure | BCrypt.Net-Next | 4.2.0 |
| | Microsoft.IdentityModel.JsonWebTokens | 8.23.0 |
| | Microsoft.Extensions.DependencyInjection.Abstractions | 10.0.14 |
| | Microsoft.Extensions.Options.ConfigurationExtensions | 10.0.14 |
| CropMarket.Persistence | Microsoft.EntityFrameworkCore.SqlServer | 10.0.14 |
| | System.Security.Cryptography.Pkcs | 10.0.14 |
| CropMarket.API | Microsoft.AspNetCore.Authentication.JwtBearer | 10.0.14 |
| | Microsoft.AspNetCore.OpenApi | 10.0.12 |
| | Microsoft.EntityFrameworkCore.Tools | 10.0.14 |
| | Swashbuckle.AspNetCore | 10.3.1 |
| CropMarket.Tests | xunit | 2.9.3 |
| | xunit.runner.visualstudio | 3.1.5 |
| | Microsoft.NET.Test.Sdk | 18.11.1 |
| | Microsoft.AspNetCore.Mvc.Testing | 10.0.14 |

## 4. Frontend packages (npm)

Declared in `Presentation/CropMarket.Web/package.json`; the exact tree is locked in `package-lock.json` and installed with `npm ci`.

| Package | Version installed | Purpose |
|---|---|---|
| react, react-dom | 19.3.1 | User interface |
| react-router | 7.18.5 | Page routing |
| i18next, react-i18next | 26.7.1, 17.1.12 | English / Turkish interface |
| tailwindcss, @tailwindcss/vite | 4.3.4 | Styling |
| @fortawesome/* | 7.3.1 (react-fontawesome 3.5.0) | Icons |
| @fontsource-variable/inter | 5.3.0 | Font |
| vite, @vitejs/plugin-react | 8.3.5, 6.2.1 | Development server and build (dev) |
| typescript | 6.0.3 | Type checking (dev) |
| eslint, typescript-eslint | 10.15.0, 8.74.0 (updated by `npm audit fix` in Week 7) | Linting (dev) |

## 5. Configuration and data

| Item | Where | In Git? |
|---|---|---|
| Database connection | `appsettings.json` → `ConnectionStrings:DefaultConnection` (LocalDB, Windows authentication, no password) | Yes |
| JWT issuer, audience, lifetime | `appsettings.json` → `Jwt` | Yes |
| **JWT signing key** | .NET user secrets (`Jwt:Key`, at least 32 characters) | **No** – each developer sets their own |
| Allowed web address (CORS) | `appsettings.json` → `Cors:AllowedOrigins` | Yes |
| API address for the web client | `.env.development` → `VITE_API_URL`; template `.env.example` | Yes (no secret) |
| Sample data | 81 Turkish cities are seeded by the migrations; users and listings are created through the app | – |
| Test database | `CropMarketTestDb` on LocalDB, created by the tests | – |
| Uploaded photos | `Presentation/CropMarket.API/wwwroot/uploads/` | No (ignored) |

**Platform limitation:** SQL Server LocalDB is only available on Windows. On Linux or macOS the connection string would have to point to a full SQL Server instance (for example in a container); this was not tested.
