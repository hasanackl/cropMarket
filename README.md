# CropTrader

A web-based marketplace that connects farmers directly with individual consumers.

> The project is called **CropTrader** in the report. The repository and the code use the name **CropMarket**
> (`CropMarket.slnx`, `CropMarket.API`, `CropMarket.Web`).

## Project Description

Farmers often sell their products through several intermediaries before the products reach the consumer, and each step adds its own cost. As a result, farmers receive only a small part of what consumers pay, and consumers who want to buy directly from producers have few easy ways to find them. CropTrader aims to remove this gap by bringing farmers and consumers together on one simple platform.

## Target Users

* **Farmers:** small and medium-sized producers who want to sell their products directly and set their own prices.
* **Consumers:** individuals who want to buy fresh agricultural products directly from producers.

## Features

|ID|Feature|Priority|Status|
|-|-|-|-|
|FR-01|Registration and login as a farmer or a consumer|Must|Implemented (Week 4)|
|FR-02|Creating product listings with price, quantity and location|Must|Implemented (Week 4)|
|FR-03|Browsing, searching and filtering listings|Must|Implemented (Week 4)|
|FR-04|Placing an order directly, with cash on delivery|Must|Implemented (Week 5)|
|FR-05|Automatic stock update after each order|Must|Implemented (Week 5)|
|FR-06|Order status tracking by the farmer|Should|Implemented (Week 5)|
|FR-07|Editing a pending order|Should|Implemented (Week 5)|
|FR-08|Cancelling a pending order|Should|Implemented (Week 5)|
|FR-09|New-order notifications for the farmer|Could|Implemented (Week 5)|
|FR-10|Viewing and editing own listings|Should|Implemented (Week 5)|
|FR-11|City list stored in the database|Could|Implemented (Week 5)|
|FR-12|Listing photos|Could|Implemented (Week 5)|
|FR-13|Changing the password|Should|Implemented (Week 5)|
|FR-14|Automatic logout when the session expires|Should|Implemented (Week 5)|

Full requirements, non-functional requirements and user stories: [docs/requirements.md](docs/requirements.md)

## Scope

**Included in the first version:** registration and login with two roles, product listings with photos, search and filtering, direct ordering with cash on delivery, automatic stock update, order editing and cancelling, order status tracking, new-order notifications and account settings.

**Not included in the first version:** online payment, delivery and cargo tracking, price negotiation or bidding, a mobile application and AI-based price prediction. These are planned as future work.

## Architecture

CropTrader is a three-layer web application: a React single-page frontend in the browser, an ASP.NET Core Web API on the server (controllers, authentication with JWT, business services with Entity Framework Core) and a SQL Server database that only the API can reach.

![CropTrader architecture](docs/design/architecture.png)

Since Week 3 the business services have moved into the Application project (one folder per feature), and a global error handler and an image storage service were added. The comparison with the Week 3 design is in [Development stage 3](docs/development-stage-3.md) and in Section 14 of the report.

Data model, API endpoints and design decisions: [component interfaces](docs/design/component-interfaces.md) · [design decisions](docs/design/design-decisions.md)

## Technologies

|Layer|Technology|
|-|-|
|Backend|ASP.NET Core Web API on .NET 10 (C#), JWT bearer authentication, BCrypt password hashing|
|Data|Entity Framework Core 10 with SQL Server LocalDB|
|Frontend|React 19 + TypeScript, Vite, React Router, Tailwind CSS, Font Awesome, i18next (EN/TR)|
|Tools|Visual Studio (optional), dotnet-ef (local tool), Swagger, Git and GitHub|

The reasons for these choices are recorded in [docs/design/design-decisions.md](docs/design/design-decisions.md).

## Project Structure

```text
CropMarket.slnx
global.json                   .NET SDK version
dotnet-tools.json             local dotnet-ef tool
Core/
  CropMarket.Domain/          entities (User, Listing, Order, City) and enums
  CropMarket.Application/     Features/ (Auth, Listings, Orders, Cities): services, requests, DTOs, results
                              Common/Interfaces: IAppDbContext, IPasswordHasher, ITokenService
Infrastructure/
  CropMarket.Persistence/     AppDbContext, entity configurations (81 cities seeded), migrations
  CropMarket.Infrastructure/  BCrypt password hashing and JWT token service
Presentation/
  CropMarket.API/             controllers, error handling, image storage, Program.cs, CropMarket.API.http
  CropMarket.Web/             React + TypeScript client (.nvmrc, .env.example)
Tests/
  CropMarket.Tests/           xUnit tests: Services/, Api/, Performance/, Robustness/
```

## Installation and Running

The complete step-by-step guide, with expected output and common problems, is in
[docs/installation/installation-guide.md](docs/installation/installation-guide.md).
Tested versions of all tools and packages: [docs/installation/dependencies.md](docs/installation/dependencies.md).

**Prerequisites (tested versions):** Windows 10/11 · .NET SDK 10.0.401 or newer (pinned in `global.json`) ·
SQL Server Express LocalDB (tested: SQL Server 2025 LocalDB) · Node.js 22.12 or newer (tested: 22.20.0, see `.nvmrc`) · Git.
Visual Studio is optional.

**Quick start** (Command Prompt, from the repository folder):

```cmd
git clone https://github.com/hasanackl/cropMarket.git
cd cropMarket
dotnet tool restore
dotnet user-secrets set "Jwt:Key" "<any random text of at least 32 characters>" --project Presentation/CropMarket.API
dotnet ef database update --project Infrastructure/CropMarket.Persistence --startup-project Presentation/CropMarket.API
dotnet run --project Presentation/CropMarket.API --launch-profile http
```

The API runs at http://localhost:5045 (Swagger: http://localhost:5045/swagger).
`Presentation/CropMarket.API/CropMarket.API.http` contains example requests for every endpoint.

In a second Command Prompt:

```cmd
cd Presentation\CropMarket.Web
npm ci
npm run dev
```

Open http://localhost:5173.

**Configuration:** the JWT signing key is kept in .NET user secrets and is never committed. All other settings
(LocalDB connection string, JWT issuer/audience, `Cors:AllowedOrigins`) are in `appsettings.json`; the web client reads
`VITE_API_URL` from `.env.development` (template: `.env.example`). The migrations create the database and the 81 cities.
Uploaded listing photos are saved in `Presentation/CropMarket.API/wwwroot/uploads/` and are not added to Git.

## Testing

The test project `Tests/CropMarket.Tests` (xUnit) contains 34 test methods (39 cases):

* **Service tests** for the business rules of `AuthService`, `ListingService` and `OrderService`
* **API integration tests** with `WebApplicationFactory`: 401, 403, ProblemDetails, the complete order flow
* **Concurrency tests** for the RowVersion check on the stock
* **NFR-01 measurement:** search with 1,000 extra listings
* **Boundary tests** that found two defects (fixed in Week 6)

The tests use their own SQL Server LocalDB database `CropMarketTestDb`, which is created from the migrations at the start of every run.

```cmd
dotnet test Tests/CropMarket.Tests
```

Latest result: 39 passed, 0 failed. Test plan and results: [docs/testing/test-plan.md](docs/testing/test-plan.md) · [docs/testing/test-results.md](docs/testing/test-results.md)

## Current Status

Week 7 – Reproducibility, installation and integration. The complete use case was run end to end, and the project was installed
from a fresh clone using only the [installation guide](docs/installation/installation-guide.md): all eight checks passed
(clone, dependencies, configuration, database and start, main use case, 39/39 tests, web build, solution build).
The toolchain is pinned (`global.json`, `dotnet-tools.json`, `.nvmrc`) and a scan of all commits found no secrets.
One problem found by the fresh-clone test was fixed and retested:
* `npm ci` reported 9 moderate vulnerabilities in development packages (minimatch via eslint); `npm audit fix` removed them.

Details: [Development stage 5](docs/development-stage-5.md) · [Reproducibility results](docs/testing/reproducibility-results.md)

### Known limitations

* The React client has no automated tests; the screens were checked manually (`evidence/week-06/ui*.png`).
* The installation was tested on Windows only (LocalDB is Windows-only) and by the developer, not by a second person.
* The quantity of a listing still accepts more than two decimals (only the order quantity was fixed).
* NFR-01 was measured inside the test process, without network and browser time.
* Notifications are checked when the page loads; they are not pushed in real time.
* Photos are stored on the local disk of the API, not in cloud storage.
* Online payment, delivery tracking and the mobile application are future work.

## Documentation

* [Project description](docs/project-description.md)
* [Requirements](docs/requirements.md)
* [References](docs/references.md)
* [Design decisions](docs/design/design-decisions.md)
* [Component interfaces and API endpoints](docs/design/component-interfaces.md)
* [Week 3 progress](docs/weekly-progress/week03.md)
* [Development stage 1](docs/development-stage-1.md)
* [Week 4 progress](docs/weekly-progress/week04.md)
* [Development stage 2](docs/development-stage-2.md)
* [Development stage 3](docs/development-stage-3.md)
* [Week 5 progress](docs/weekly-progress/week05.md)
* [Development stage 4](docs/development-stage-4.md)
* [Test plan](docs/testing/test-plan.md)
* [Test results](docs/testing/test-results.md)
* [Week 6 progress](docs/weekly-progress/week06.md)
* [Installation guide](docs/installation/installation-guide.md)
* [Dependencies and tested environment](docs/installation/dependencies.md)
* [Development stage 5](docs/development-stage-5.md)
* [Reproducibility results](docs/testing/reproducibility-results.md)
* [Week 7 progress](docs/weekly-progress/week07.md)
