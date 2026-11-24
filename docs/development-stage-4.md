# Development Stage 4 – Testing and Correction (Week 6)

## Record

| Field | Description |
|-------|-------------|
| Date | 24 November 2026 |
| Objective | Show with systematic tests that the features of Weeks 4 and 5 work, close the open checks from Week 5 (403 for another farmer's order, two orders at the same moment, NFR-01) and correct the defects that the tests find. |
| Requirement IDs | FR-01 to FR-10, FR-13, NFR-01, NFR-02, NFR-03 |
| Functionality tested | Registration, login and password change; listing creation, search and editing; ordering, stock update, status changes, edit, cancel and notifications; roles and ownership; error format; search time. 34 automated test methods (39 cases) and 8 manual UI scenarios. Details: [test plan](testing/test-plan.md), [test results](testing/test-results.md). |
| Technical decision | xUnit was chosen because it is the standard test framework for .NET and works with `WebApplicationFactory`, which starts the real API in memory. The tests use a separate SQL Server LocalDB database created from the real migrations, because the EF Core InMemory provider and SQLite do not create `rowversion` values and do not round `decimal(10,2)` like SQL Server; both were needed to test the stock rules realistically. The React client was tested manually, because it has no automated test setup yet. |
| Problem | (1) TC33: an order of 0.001 kg was accepted and saved as 0.00 kg with the stock unchanged; 10.555 kg was saved as 10.56 kg while the stock became 39.45 kg (50.01 kg sold from 50 kg). (2) TC34: two sign-ups with the same e-mail at the same moment returned 200 and 500 (`SqlException 2601`, unique index `IX_Users_Email`). |
| Diagnosis | (1) The database keeps quantities with two decimals and rounds the rest; the service did not check the number of decimals. (2) The service checks whether the e-mail exists and then inserts it; both requests passed the check before either insert, and the database error from the unique index was not handled. |
| Solution and retest | (1) `OrderService.CheckQuantity` rejects quantities with more than two decimals (400). (2) `AuthService.RegisterAsync` catches the database error and returns "already registered" (409) when the e-mail now exists. The same three failing cases were run again and passed, and the full suite passed (39/39). |
| Evidence | [Service tests 25/25](../evidence/week-06/test-run-1-service-25-passed.png) · [All tests 36/36 and NFR-01](../evidence/week-06/test-run-2-all-36-passed-nfr01.png) · [Boundary tests before the fix (3 failed)](../evidence/week-06/test-run-3-boundary-before-fix.txt) · [Retest 3/3](../evidence/week-06/test-run-4-boundary-after-fix-3-passed.png) · [Regression 39/39](../evidence/week-06/test-run-5-all-after-fix-39-passed.png) · TRX reports in [evidence/week-06](../evidence/week-06/) · UI screenshots `ui01`–`ui08` |
| GitHub commits | [28fff7f](https://github.com/hasanackl/cropmarket/commit/28fff7f) service tests, [b5ceee2](https://github.com/hasanackl/cropmarket/commit/b5ceee2) API, concurrency and search timing tests, [e50d807](https://github.com/hasanackl/cropmarket/commit/e50d807) boundary tests, [1bc7993](https://github.com/hasanackl/cropmarket/commit/1bc7993) **bug fix** for both defects |
| Next step | Week 7: installation guide and reproducibility (another developer runs the API, the web app and `dotnet test` from the README), the same two-decimal rule for listing quantities, and a browser measurement of the search time. |

## Results in numbers

| Measure | Value |
|---------|-------|
| Automated test cases | 39 (34 methods), all passing after the fix |
| Defects found by tests | 2 (both fixed and retested) |
| Test defects corrected | 2 (TC31 expectation, parallel test collections) |
| NFR-01 worst p95 | 32.1 ms with 1,005 listings (limit 2,000 ms) |
| Manual UI scenarios | 8 planned, 7 performed and passed, 1 not run (UI-04) |
