# Installation Guide

This guide explains how to download, install, configure, build, run and test CropMarket on a new computer.
All commands were written for **Windows 10/11** and the **Command Prompt (cmd)**; they are run from the repository folder unless another folder is shown.
The tested versions are listed in [dependencies.md](dependencies.md).

## 1. Prerequisites

Install these tools first:

| Tool | Version | Download |
|---|---|---|
| Git | any recent version | https://git-scm.com/downloads |
| .NET SDK | 10.0.401 or a newer 10.0 SDK | https://dotnet.microsoft.com/download/dotnet/10.0 |
| SQL Server Express LocalDB | 2019 or newer | Installed with Visual Studio (workload "ASP.NET and web development"), or the separate SQL Server Express installer → "LocalDB" |
| Node.js | 22.12 or newer (22 LTS recommended) | https://nodejs.org |

Check the installation:

```cmd
git --version
dotnet --version
node -v
sqllocaldb info
```

`dotnet --version` must show 10.0.401 or newer, and `sqllocaldb info` must list `MSSQLLocalDB`.
Visual Studio is **not** required; every step below works from the command line.

## 2. Download the repository

```cmd
git clone https://github.com/hasanackl/cropMarket.git
cd cropMarket
```

## 3. Install the .NET tools and packages

```cmd
dotnet tool restore
dotnet restore Presentation/CropMarket.API
dotnet restore Tests/CropMarket.Tests
```

`dotnet tool restore` installs the EF Core command-line tool (`dotnet-ef` 10.0.14) from `dotnet-tools.json`, so no global tool is needed.
`global.json` makes sure that a .NET 10 SDK is used.

## 4. Configure the API

The API signs its login tokens with a secret key. The key is **not** stored in Git; every developer creates their own with .NET user secrets:

```cmd
dotnet user-secrets set "Jwt:Key" "<any random text of at least 32 characters>" --project Presentation/CropMarket.API
```

All other settings are in `Presentation/CropMarket.API/appsettings.json` and need no change for a local installation:

| Setting | Default value |
|---|---|
| `ConnectionStrings:DefaultConnection` | LocalDB, database `CropMarketDb`, Windows authentication |
| `Jwt:Issuer` / `Jwt:Audience` / `Jwt:ExpiresInMinutes` | `CropMarket.API` / `CropMarket.Web` / 60 |
| `Cors:AllowedOrigins` | `http://localhost:5173` (the web client) |

## 5. Create the database

```cmd
dotnet ef database update --project Infrastructure/CropMarket.Persistence --startup-project Presentation/CropMarket.API
```

Expected output ends with `Done.` The command creates the database `CropMarketDb` on LocalDB, all tables and the list of 81 Turkish cities.
No other sample data is needed: users and listings are created through the application.

## 6. Start the API

```cmd
dotnet run --project Presentation/CropMarket.API --launch-profile http
```

Expected output:

```text
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5045
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

Swagger is now available at http://localhost:5045/swagger. Keep this window open.

## 7. Install and start the web client

Open a **second** Command Prompt in the repository folder:

```cmd
cd Presentation\CropMarket.Web
npm ci
npm run dev
```

`npm ci` installs exactly the package versions in `package-lock.json`. Expected output of `npm run dev`:

```text
  VITE v8.3.5  ready in ... ms

  ➜  Local:   http://localhost:5173/
```

Open http://localhost:5173. The web client reads the API address from `.env.development` (`VITE_API_URL=http://localhost:5045`).
To use another address, copy `.env.example` to `.env.development.local` and change the value there.

## 8. Check the main use case

1. Register as a **farmer** and create a listing (a photo is optional).
2. Log out, register as a **consumer**, search for the product and place an order.
3. Log in as the farmer again: the bell shows the new order. Change its status to *Preparing* and then *Delivered*.
4. Log in as the consumer: *My orders* shows the order as *Delivered*.

Screenshots of this run are in `evidence/week-07/e2e-*.png`.

## 9. Run the tests

Stop nothing; the tests use their own database `CropMarketTestDb`, which they create and delete themselves.

```cmd
dotnet test Tests/CropMarket.Tests
```

Expected result: `Passed! - Failed: 0, Passed: 39`.
The web client can be checked with `npm run lint` and `npm run build` in `Presentation\CropMarket.Web`.

## 10. Common installation problems

| Message or symptom | Cause | Solution |
|---|---|---|
| `A compatible .NET SDK was not found` / `Requested SDK version: 10.0.401` | Only an older SDK is installed | Install the .NET 10 SDK (10.0.401 or newer) |
| `Could not execute because the specified command or file was not found` after `dotnet ef` | The local tool was not restored | Run `dotnet tool restore` in the repository folder |
| `Jwt:Key is missing. Set it with dotnet user-secrets.` when the API starts | Step 4 was skipped | Set the key with `dotnet user-secrets set` (step 4) |
| `A network-related or instance-specific error occurred ...` during `dotnet ef database update` or `dotnet test` | LocalDB is not installed or not started | Install LocalDB; then `sqllocaldb start MSSQLLocalDB` |
| `Failed to bind to address http://127.0.0.1:5045: address already in use` | Another program (or a second API window) uses the port | Close it, or change the port in `launchSettings.json` **and** `VITE_API_URL` |
| `npm warn EBADENGINE` or Vite stops with a Node.js version message | Node.js is older than 22.12 | Install Node.js 22 LTS (`.nvmrc` contains the version for nvm users) |
| The web page shows a network error / the browser console shows a CORS error | The API is not running, or its address is different from `VITE_API_URL` / `Cors:AllowedOrigins` | Start the API (step 6) and keep the three addresses consistent |

To start again with an empty database: `dotnet ef database drop --project Infrastructure/CropMarket.Persistence --startup-project Presentation/CropMarket.API`, then step 5.

## 11. Platform limitation

SQL Server LocalDB exists only on Windows. On Linux or macOS the API and the tests need a full SQL Server instance (for example SQL Server in a Docker container) and a changed connection string. This configuration was **not** tested in this project.
