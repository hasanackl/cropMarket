# Week 5 – Core Implementation and Software Quality

| Field | Response |
|-------|----------|
| Student | Hasan Açıkel |
| Project title | CropTrader – A Web Marketplace Connecting Farmers and Consumers |
| Tasks planned | Review the Week 4 prototype; Stage 2 (place orders, reduce stock, FR-04, FR-05); Stage 3 (order status and the full workflow, FR-06); code quality improvements; architecture comparison; README and report update. |
| Tasks completed | All planned tasks. In addition, the remaining features of the first version were implemented and added as FR-07 to FR-14: order edit and cancel, new-order notifications, listing edit, cities from the database, listing photos, password change and logout when the session expires. |
| GitHub commits | [0240a8e](https://github.com/hasanackl/cropmarket/commit/0240a8e), [12953d1](https://github.com/hasanackl/cropmarket/commit/12953d1), [b8b1bba](https://github.com/hasanackl/cropmarket/commit/b8b1bba), [03e9f5a](https://github.com/hasanackl/cropmarket/commit/03e9f5a) (Stage 2); [334aba8](https://github.com/hasanackl/cropmarket/commit/334aba8), [06b3f5a](https://github.com/hasanackl/cropmarket/commit/06b3f5a), [ab9b3a5](https://github.com/hasanackl/cropmarket/commit/ab9b3a5), [aa60624](https://github.com/hasanackl/cropmarket/commit/aa60624), [2d80035](https://github.com/hasanackl/cropmarket/commit/2d80035), [bb5e6fe](https://github.com/hasanackl/cropmarket/commit/bb5e6fe), [0d6f819](https://github.com/hasanackl/cropmarket/commit/0d6f819) (Stage 3 and quality) |
| Problems encountered | HTTP0012 in the Visual Studio `.http` file when a named request had not been sent; a test that logged in with the wrong farmer account; build failure because the running API locked the DLL files; a unit-lock test run on a listing without orders. |
| Solutions attempted | Send the login and listing requests first; correct the test data and keep the ownership test for Week 6; stop the API before building; repeat the test after placing an order. |
| References consulted | Microsoft Learn: EF Core concurrency conflicts, EF Core data seeding, handle errors in ASP.NET Core web APIs (IExceptionHandler, ProblemDetails), file uploads in ASP.NET Core, static files; RFC 9457 Problem Details for HTTP APIs. |
| Tests / checks performed | `.http` requests 11–60 (orders, invalid quantities, status rules, edit, cancel, notifications, listing edit, photos, password change, error format) and browser checks of every new page. Evidence in [evidence/week-05](../../evidence/week-05/). |
| Report sections updated | 4 Requirements (FR-07 to FR-14), 14 System Architecture (planned versus implemented), 15 Technology Selection, 17 Implementation, 18 Development Process (Stages 2 and 3, limitations). |
| Next week plan | Week 6: unit tests for the order rules, API integration tests, the 403 ownership test and the concurrent-order test, NFR-01 search time with 100 listings, and fixing the bugs found. |

Details: [Development stage 2](../development-stage-2.md) · [Development stage 3](../development-stage-3.md)
