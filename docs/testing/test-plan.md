# Test Plan (Week 6)

## 1. Scope

The tests check the functional requirements FR-01 to FR-13 and the non-functional requirements NFR-01 (search time),
NFR-02 (invalid quantities) and NFR-03 (roles and ownership) that were implemented in Weeks 4 and 5.
FR-14 (logout when the token expires) is a browser timer and is covered only by the manual UI check of Week 5.

## 2. Test levels and why they were chosen

| Level | Tool | What it covers | Why this level |
|-------|------|----------------|----------------|
| Service tests (component) | xUnit 2.9 | `AuthService`, `ListingService`, `OrderService` business rules called directly (TC01–TC23, TC33) | The rules (quantity limits, stock, status order, ownership) live in the Application services, so they can be tested without HTTP. |
| API integration tests | xUnit + `WebApplicationFactory` (Microsoft.AspNetCore.Mvc.Testing) | The real `Program.cs`: routing, JWT roles, controllers, ProblemDetails, global error handler (TC24–TC31, TC34) | 401, 403 and the error format are produced by middleware and attributes, so they can only be checked through the HTTP pipeline. |
| Concurrency tests | Same tools, two DbContexts or parallel HTTP requests | RowVersion check on the stock (TC17, TC31) | Two orders at the same moment must not sell the same stock (FR-05, ADR-02). |
| Performance measurement | xUnit + `Stopwatch` | NFR-01 search time with 1,000 extra listings, 20 requests per query (TC32) | NFR-01 is a measurable requirement. |
| Boundary / robustness tests | xUnit | Values at the edge of the data model and double submissions (TC33, TC34) | Chosen from the database types (`decimal(10,2)`) and the unique e-mail index, not from the normal flow. |
| Manual UI (system) tests | Browser, screenshots | Main screens of both roles in EN and TR (UI-01 to UI-08) | Checks what the user actually sees; the React client has no automated tests yet. |

## 3. Test environment

* Windows 11, .NET SDK 10.0.401, Visual Studio, SQL Server LocalDB.
* All automated tests use a separate database `CropMarketTestDb`. It is deleted and created again with the
  real EF Core migrations at the start of every run, so the 81 seeded cities and all constraints are the same as in production.
* **Why LocalDB and not the EF Core InMemory provider or SQLite:** the InMemory provider and SQLite do not generate
  SQL Server `rowversion` values and do not round `decimal(10,2)` like SQL Server, so the concurrency rule (TC17, TC31)
  and the quantity defect found by TC33 could not have been tested realistically.
* The API tests start the API in memory with the environment `Testing` and a test-only JWT key; the real key stays in user-secrets.
* All test classes are in one xUnit collection, so they run one after another on the same database.
* Every test creates its own users and listings (unique e-mail addresses), so no test depends on another one.

## 4. Test-case design

Each test has an ID (TC01–TC34, UI-01–UI-08), one objective, the input, the expected result and the actual result
(see [test-results.md](test-results.md)). Inputs were chosen with:

* **Equivalence classes:** valid order, invalid quantity, unknown category or city, wrong role, other owner.
* **Boundary values:** quantity 0, -1, exactly the stock (50), stock + 1 (51), 1.5 for a piece unit, 0.001 and 10.555 (more decimals than the database keeps).
* **State transitions:** Pending → Preparing → Delivered, Delivered → Pending (not allowed), cancel twice.
* **Concurrency:** a second order based on an old stock value; five parallel orders; two parallel sign-ups.

## 5. Requirement traceability

| Requirement | Tests |
|-------------|-------|
| FR-01 Registration and login | TC01, TC02, TC03, TC24, TC34, UI-01 |
| FR-02 Create listing | TC08, TC26, UI-02 |
| FR-03 Search | TC06, TC07, TC29, UI-03 |
| FR-04 Place order | TC11, TC16, TC29, UI-05 |
| FR-05 Stock update | TC11, TC14, TC17, TC21, TC31, UI-05 |
| FR-06 Order status | TC19, TC20, TC29, UI-06, UI-07 |
| FR-07 Edit order | TC22 |
| FR-08 Cancel order | TC21 |
| FR-09 Notifications | TC23, UI-06 |
| FR-10 Edit listing | TC09, TC10 |
| FR-13 Change password | TC04, TC05 |
| NFR-01 Search under 2 s | TC32 |
| NFR-02 Invalid quantity | TC12, TC13, TC15, TC30, TC33 |
| NFR-03 Roles and ownership | TC09, TC18, TC25, TC26, TC27, TC28 |

## 6. How to run

```bash
dotnet test Tests/CropMarket.Tests --logger "trx;LogFileName=results.trx"
```

The first run creates `CropMarketTestDb` in LocalDB. The NFR-01 timing is written to
`Tests/CropMarket.Tests/bin/Debug/net10.0/nfr01-search-timing.txt`.
