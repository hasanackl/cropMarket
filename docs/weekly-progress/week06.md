# Week 6 – Testing and Validation

| Field | Response |
|-------|----------|
| Student | Hasan Açıkel |
| Project title | CropTrader – A Web Marketplace Connecting Farmers and Consumers |
| Tasks planned | Choose test methods; write service, API, concurrency and performance tests; run manual UI scenarios; find, fix and retest defects; Development Stage 4; README and report update. |
| Tasks completed | All planned tasks. Test project `Tests/CropMarket.Tests` with 34 test methods (39 cases), 8 manual UI scenarios (7 performed), two defects found and fixed, NFR-01 measured. |
| GitHub commits | [28fff7f](https://github.com/hasanackl/cropmarket/commit/28fff7f), [b5ceee2](https://github.com/hasanackl/cropmarket/commit/b5ceee2), [e50d807](https://github.com/hasanackl/cropmarket/commit/e50d807), [1bc7993](https://github.com/hasanackl/cropmarket/commit/1bc7993) (bug fix) |
| Problems encountered | TC33: quantities with more than two decimals were rounded by the database (a 0.00 kg order, 0.01 kg oversold). TC34: two sign-ups at the same moment gave a 500 error. While preparing: a wrong expectation in the parallel order test and two test collections sharing one database. |
| Solutions attempted | Decimal check in `OrderService`; handling of the unique-index error in `AuthService`; the same tests were run again and the full suite passed. Test expectation corrected; one test collection. |
| References consulted | Microsoft Learn: unit testing C# with xUnit, integration tests in ASP.NET Core (`WebApplicationFactory`), testing against a production database system (EF Core), handling concurrency conflicts. |
| Tests / checks performed | `dotnet test`: 25/25 (service), 36/36 (service + API + performance), 3 failed → 3/3 after the fix, 39/39 regression. Manual UI checks UI-01 to UI-08. Evidence in [evidence/week-06](../../evidence/week-06/). |
| Report sections updated | 18 Development Process (Stage 4), new Testing Methodology, Validation, Testing Results and Experimental Results sections. |
| Next week plan | Week 7: installation and reproducibility guide, run the project from a clean clone, two-decimal rule for listing quantities, browser search-time measurement. |

Details: [Development stage 4](../development-stage-4.md) · [Test plan](../testing/test-plan.md) · [Test results](../testing/test-results.md)
