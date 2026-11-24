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
|Tools|Visual Studio, Swagger, Git and GitHub|

The reasons for these choices are recorded in [docs/design/design-decisions.md](docs/design/design-decisions.md).

## Project Structure

```text
CropMarket.slnx
Core/
  CropMarket.Domain/          entities (User, Listing, Order, City) and enums
  CropMarket.Application/     Features/ (Auth, Listings, Orders, Cities): services, requests, DTOs, results
                              Common/Interfaces: IAppDbContext, IPasswordHasher, ITokenService
Infrastructure/
  CropMarket.Persistence/     AppDbContext, entity configurations (81 cities seeded), migrations
  CropMarket.Infrastructure/  BCrypt password hashing and JWT token service
Presentation/
  CropMarket.API/             controllers, error handling, image storage, Program.cs, CropMarket.API.http
  CropMarket.Web/             React + TypeScript client
Tests/
  CropMarket.Tests/           xUnit tests: Services/, Api/, Performance/, Robustness/
```

## Running the Project

**Requirements:** .NET 10 SDK, Node.js 22 or newer, SQL Server LocalDB (installed with Visual Studio).

**1. Backend**

```bash
cd Presentation/CropMarket.API
dotnet user-secrets set "Jwt:Key" "<a random secret of at least 32 characters>"
cd ../..
dotnet tool install --global dotnet-ef
dotnet ef database update --project Infrastructure/CropMarket.Persistence --startup-project Presentation/CropMarket.API
dotnet run --project Presentation/CropMarket.API --launch-profile http
```

The API runs at http://localhost:5045 and Swagger at http://localhost:5045/swagger.
`Presentation/CropMarket.API/CropMarket.API.http` contains example requests for every endpoint.

**2. Frontend** (in a second terminal)

```bash
cd Presentation/CropMarket.Web
npm install
npm run dev
```

Open http://localhost:5173. The API address is set in `Presentation/CropMarket.Web/.env.development`.
Uploaded listing photos are saved in `Presentation/CropMarket.API/wwwroot/uploads/` and are not added to Git.
The allowed web address for CORS is set in `Cors:AllowedOrigins` in `appsettings.json`.

## Testing

The test project `Tests/CropMarket.Tests` (xUnit) contains 34 test methods (39 cases):

* **Service tests** for the business rules of `AuthService`, `ListingService` and `OrderService`
* **API integration tests** with `WebApplicationFactory`: 401, 403, ProblemDetails, the complete order flow
* **Concurrency tests** for the RowVersion check on the stock
* **NFR-01 measurement:** search with 1,000 extra listings
* **Boundary tests** that found two defects (fixed in Week 6)

The tests use their own SQL Server LocalDB database `CropMarketTestDb`, which is created from the migrations at the start of every run.

```bash
dotnet test Tests/CropMarket.Tests
```

Latest result: 39 passed, 0 failed. Test plan and results: [docs/testing/test-plan.md](docs/testing/test-plan.md) · [docs/testing/test-results.md](docs/testing/test-results.md)

## Current Status

Week 6 – Testing and validation. The complete marketplace workflow of Week 5 is now covered by automated tests.
The open checks from Week 5 passed: 403 for another farmer's order, two orders at the same moment and the search time.
Two defects found by boundary tests were fixed and retested:
* order quantities with more than two decimals were rounded by the database;
* two sign-ups with the same e-mail at the same moment returned a server error.

Details: [Development stage 4](docs/development-stage-4.md)

### Known limitations

* The React client has no automated tests; the screens were checked manually (`evidence/week-06/ui*.png`).
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
