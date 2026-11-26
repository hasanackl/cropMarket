# Reproducibility and Integration Test Results (Week 7)

## 1. Integration test (end-to-end use case)

Date: 26 November 2026, 13:50–13:57 (UTC+3) · Tester: Hasan Açıkel · Environment: development copy, database `CropMarketDb`

| ID | Step | Components involved | Result |
|---|---|---|---|
| E1 | Register as a farmer | Web → `POST /api/auth/register` → AuthService → Users | Pass |
| E2 | Create a listing with a photo (Onion, 30 TL/kg, 80 kg, Ankara) | Web → `POST /api/listings` (multipart) → ListingService → Listings + `wwwroot/uploads` | Pass |
| E3 | Register as a consumer | Web → register → JWT stored in the browser | Pass |
| E4 | Search with the Ankara filter | Web → `GET /api/listings?location=` → Cities | Pass (1 active listing) |
| E5 | Order 10 kg | Web → `POST /api/orders` → transaction + RowVersion → stock 80 → 70 kg | Pass (300 TL) |
| E6 | Farmer sees the bell notification | Web → `GET /api/orders/received` | Pass ("Steve ordered 10 kg of Onion") |
| E7 | Farmer sets the status to Delivered | Web → `PATCH /api/orders/{id}/status` | Pass |
| E8 | Consumer sees Delivered in *My orders* | Web → `GET /api/orders/mine` | Pass |

No integration problem was found. Evidence: [`evidence/week-07/e2e-01` … `e2e-08`](../../evidence/week-07/).

## 2. Reproducibility test (fresh clone)

| Field | Value |
|---|---|
| Date | 26 November 2026, 16:09–16:26 (UTC+3) |
| Tester | Hasan Açıkel (no peer was available; see limitations) |
| Environment | Windows 11 Pro 10.0.26200, .NET SDK 10.0.401, Node.js 22.20.0, npm 10.9.3, SQL Server 2025 LocalDB, Windows PowerShell 5.1 |
| Repository state | Branch `docs/week7-installation`, commit `3a8ca19`, cloned from GitHub into an empty folder `C:\temp\cropmarket-fresh` |
| Instructions followed | [Installation guide](../installation/installation-guide.md) (commands copied unchanged) |

**Preparing a clean state on the same computer.** Three things from the existing installation would have hidden problems, so they were removed before the test:
the global `dotnet-ef` tool was uninstalled (so only `dotnet tool restore` could provide it); the user secrets were backed up and cleared (a clone uses the same `UserSecretsId`, so the JWT key would otherwise already exist);
and a new database name `CropMarketFreshDb` was set for this terminal with the environment variable `ConnectionStrings__DefaultConnection` (so that the migrations had to create a new database). This variable was the only difference from the guide.

| ID | Operation | Expected result | Actual result | Status |
|---|---|---|---|---|
| R01 | Clone repository | Repository downloaded | 775 objects, 13.32 MiB; `git log` shows `3a8ca19` | Pass |
| R02 | Install dependencies | Tools and packages restored | `dotnet --version` 10.0.401; `dotnet tool restore` installed dotnet-ef 10.0.14; `dotnet restore` API 4.3 s, Tests 2.4 s; `npm ci` added 184 packages in 2 min (with 9 moderate audit warnings, see section 3) | Pass |
| R03 | Configure system | Clear message without the key; key accepted | Without the key: `System.InvalidOperationException: Jwt:Key is missing. Set it with dotnet user-secrets.` (same text as in the guide); `dotnet user-secrets set` → "Successfully saved Jwt:Key to the secret store." | Pass |
| R04 | Build / start | Database created, API listening on 5045 | `dotnet ef database update`: `CREATE DATABASE [CropMarketFreshDb]`, 4 migrations, 81 cities, "Done."; `dotnet run`: "Now listening on: http://localhost:5045", content root in the fresh folder; Swagger opened | Pass |
| R05 | Main use case | Order placed and delivered | New farmer "demo" listed Onion 50 TL/kg (Adana, photo); new consumer "demoUser" ordered 5 kg → "Your order has been placed! You will pay ₺250.00 on delivery.", stock 100 → 95 kg; farmer set the order to Delivered | Pass |
| R06 | Run tests | All tests pass | `dotnet test Tests/CropMarket.Tests`: total 39, failed 0, passed 39, 16.9 s | Pass |
| R07 | Build web client | Production build created | `npm run build`: 124 modules, built in 502 ms | Pass |
| R08 | Build whole solution | All projects build | `dotnet build CropMarket.slnx`: 7 projects built, **9 warnings** from `CropMarket.Web.esproj` (npm audit) | Pass with warnings → fixed |

Evidence: [`fresh-02-swagger.png`](../../evidence/week-07/fresh-02-swagger.png), [`fresh-04-order.png`](../../evidence/week-07/fresh-04-order.png), [`fresh-05-delivered.png`](../../evidence/week-07/fresh-05-delivered.png), [`fresh-06-07-tests-and-sln-build.png`](../../evidence/week-07/fresh-06-07-tests-and-sln-build.png), terminal output [part 1](../../evidence/week-07/fresh-clone-terminal-part1.txt) and [part 2](../../evidence/week-07/fresh-clone-terminal-part2.txt).

## 3. Problem found, correction and retest

| Step | Description |
|---|---|
| Problem | `npm ci` (R02) reported "9 moderate severity vulnerabilities", and the same 9 items appeared as warnings in the solution build (R08). |
| Diagnosis | `npm audit` showed one advisory: minimatch 7.0.0–11.0.0 has a potential denial of service via globparts amplification ([GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249)). It came through eslint 10.14.0, @eslint/config-array 0.23.5 and typescript-eslint 8.72.1 (all development packages used only for linting, not part of the built application). npm reported that a compatible fix was available. ([before](../../evidence/week-07/npm-audit-before.txt)) |
| Solution | `npm audit fix` (without `--force`): 1 package added, 16 changed. Only `package-lock.json` changed; the ranges in `package.json` already allowed the fixed versions (eslint 10.15.0, typescript-eslint 8.74.0, minimatch 11.0.9). |
| Retest | `npm audit`: found 0 vulnerabilities ([after](../../evidence/week-07/npm-audit-after.txt), [versions](../../evidence/week-07/npm-versions-after.txt)); `npm run lint`: no errors; `npm run build`: 124 modules, same output sizes; `dotnet build CropMarket.slnx`: 0 warnings, 0 errors ([output](../../evidence/week-07/sln-build-after-fix.txt)). |
| Commit | [b92ed55](https://github.com/hasanackl/cropmarket/commit/b92ed55) `fix: update eslint dependencies to resolve npm audit warnings` |

**Other observations (no code change):**
- During the test the API was first started by mistake from the existing development folder instead of the fresh clone. This was noticed from the `Content root path` line, the API was stopped, and the attempt was not counted. The guide now says that all commands are run in the new folder.
- When the JWT key is missing, the API stops with the correct message but also prints a stack trace. This is acceptable for a developer tool and was left unchanged.
- Windows PowerShell 5.1 `Start-Transcript` did not record the output of `dotnet`, `npm` and `git`; the terminal text was therefore copied from the console.

## 4. Limitations

- The test was done on the developer's own computer, not by a peer. The NuGet cache and the installed SDK, Node.js and LocalDB were already present, so a first-time installation of these tools was not tested.
- The solution build (R08) used the Visual Studio JavaScript SDK of the installed Visual Studio 2026; a computer without Visual Studio was not tested.
- Linux and macOS were not tested because SQL Server LocalDB is Windows-only.
