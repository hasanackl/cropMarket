# CropTrader

A web-based marketplace that connects farmers directly with individual consumers.

> The project is called \*\*CropTrader\*\* in the report. The repository and the code use the name \*\*CropMarket\*\*
> (`CropMarket.slnx`, `CropMarket.API`, `CropMarket.Web`).

## Project Description

Farmers often sell their products through several intermediaries before the products reach the consumer, and each step adds its own cost. As a result, farmers receive only a small part of what consumers pay, and consumers who want to buy directly from producers have few easy ways to find them. CropTrader aims to remove this gap by bringing farmers and consumers together on one simple platform.

## Target Users

* **Farmers:** small and medium-sized producers who want to sell their products directly and set their own prices.
* **Consumers:** individuals who want to buy fresh agricultural products directly from producers.

## Planned Features

|ID|Feature|Priority|
|-|-|-|
|FR-01|Registration and login as a farmer or a consumer|Must|
|FR-02|Creating product listings with price, quantity and location|Must|
|FR-03|Browsing, searching and filtering listings|Must|
|FR-04|Placing an order directly, with cash on delivery|Must|
|FR-05|Automatic stock update after each order|Must|
|FR-06|Order status tracking by the farmer|Should|

Full requirements, non-functional requirements and user stories: [docs/requirements.md](docs/requirements.md)

## Scope

**Included in the first version:** registration and login with two roles, product listings, search and filtering, direct ordering with cash on delivery, automatic stock update and order status tracking.

**Not included in the first version:** online payment, delivery and cargo tracking, price negotiation or bidding, a mobile application and AI-based price prediction. These are planned as future work.

## Architecture

CropTrader is a three-layer web application: a React single-page frontend in the browser, an ASP.NET Core Web API on the server (controllers, authentication with JWT, business services with Entity Framework Core) and a SQL Server database that only the API can reach.

!\[CropTrader architecture](docs/design/architecture.png)

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
  CropMarket.Domain/          entities (User, Listing) and enums
  CropMarket.Application/     DTOs and service interfaces (Auth, Listings)
Infrastructure/
  CropMarket.Persistence/     AppDbContext, entity configurations, services, migrations
  CropMarket.Infrastructure/  password hashing and JWT token service
Presentation/
  CropMarket.API/             controllers, Program.cs, CropMarket.API.http
  CropMarket.Web/             React + TypeScript client
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

## Current Status

Week 4 – First working prototype. A farmer can register, log in and publish a listing, and anyone can search
and filter the listings (FR-01, FR-02, FR-03). The prototype uses every layer of the architecture: React client,
ASP.NET Core Web API, EF Core and SQL Server. Details: [Development stage 1](docs/development-stage-1.md).
Next step (Week 5): placing orders, automatic stock update and order status (FR-04 to FR-06).

## Documentation

* [Project description](docs/project-description.md)
* [Requirements](docs/requirements.md)
* [References](docs/references.md)
* [Design decisions](docs/design/design-decisions.md)
* [Component interfaces and API endpoints](docs/design/component-interfaces.md)
* [Week 3 progress](docs/weekly-progress/week03.md)
* [Development stage 1](docs/development-stage-1.md)
* [Week 4 progress](docs/weekly-progress/week04.md)

