# Development Stage 5 – Integrated and Reproducible System (Week 7)

## Record

| Field | Description |
|-------|-------------|
| Date and objective | 26 November 2026. Confirm that the components of Weeks 4–6 work together as one system, and make the system reproducible: another developer should be able to install, configure, run and test it using only the repository and its instructions. |
| Integrated components | React web client (`CropMarket.Web`) → HTTP/JSON with a JWT bearer token → ASP.NET Core Web API (`CropMarket.API`: controllers, error handling, image storage) → application services (`CropMarket.Application`) → EF Core (`CropMarket.Persistence`) → SQL Server LocalDB; photos in `wwwroot/uploads`; password hashing and tokens in `CropMarket.Infrastructure`. The complete use case (register → listing with photo → search → order → notification → Delivered) was run end to end (E1–E8). The architecture did not change in Week 7. |
| Technical decision | The toolchain is pinned in the repository instead of being described only in text: `global.json` (.NET SDK 10.0.401, newer 10.0 feature bands allowed), a local tool manifest `dotnet-tools.json` (dotnet-ef 10.0.14, the same version as the EF Core packages, so `dotnet tool restore` replaces a global install), `.nvmrc` and `engines` (Node.js ≥ 22.12, required by Vite 8), and `package-lock.json` with `npm ci`. The JWT key stays in .NET user secrets; `.env.example` documents the only web setting. Docker was not used: the target users of the guide are Windows developers, LocalDB needs no server setup, and the program does not require containers. |
| Problem and solution | The fresh-clone test showed 9 moderate `npm audit` warnings (minimatch GHSA-g3hv-75wg-m249 through eslint and typescript-eslint), which also appeared as warnings in `dotnet build CropMarket.slnx`. `npm audit fix` updated `package-lock.json` (eslint 10.15.0, typescript-eslint 8.74.0, minimatch 11.0.9). Retest: 0 vulnerabilities, lint and build pass, solution build 0 warnings. The guide was also clarified after the tester started the API from the wrong folder once. |
| Evidence and test results | Integration E1–E8: all passed. Reproducibility R01–R08 from a fresh clone of commit `3a8ca19`: all passed (R08 with warnings, fixed). `dotnet test`: 39/39 in 16.9 s. Secret scan of all 43 commits: no secrets. Details: [reproducibility results](testing/reproducibility-results.md), screenshots and terminal output in [evidence/week-07](../evidence/week-07/). |
| GitHub commit links | [9d44829](https://github.com/hasanackl/cropmarket/commit/9d44829) pin .NET SDK, dotnet-ef and Node · [e1c0b11](https://github.com/hasanackl/cropmarket/commit/e1c0b11) end-to-end evidence · [3a8ca19](https://github.com/hasanackl/cropmarket/commit/3a8ca19) installation guide and README · [b92ed55](https://github.com/hasanackl/cropmarket/commit/b92ed55) **fix** npm audit warnings |
| Limitations and next step | No peer was available: the test ran on the developer's computer from a fresh clone, with the existing SDK, Node.js, LocalDB and NuGet cache. A computer without Visual Studio, and Linux/macOS, were not tested. Week 8: final report and professional README; remaining small items (two-decimal rule for listing quantities, browser measurement of the search time). |

## Results in numbers

| Measure | Value |
|---------|-------|
| End-to-end integration steps | 8 of 8 passed |
| Reproducibility checks | 8 of 8 passed (1 with warnings, corrected) |
| Automated tests in the fresh clone | 39 passed, 0 failed |
| Problems found / corrected | 1 / 1 (npm audit warnings) |
| Commits scanned for secrets | 43, none found |
