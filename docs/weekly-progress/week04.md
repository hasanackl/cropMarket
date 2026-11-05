# Week 4 – First Working Prototype

| Field | Response |
|-------|----------|
| Tasks planned and completed | Prototype scope (FR-01, FR-02, FR-03), development environment, layered backend (Domain, Application, Persistence, Infrastructure, API), React client, preliminary verification P01–P13, README run instructions. |
| New files | `Core/`, `Infrastructure/`, `Presentation/` projects, `docs/development-stage-1.md`, `evidence/week-04/`, this file. |
| GitHub commits | [38937db](https://github.com/hasanackl/cropmarket/commit/38937db) scaffold, [4272bef](https://github.com/hasanackl/cropmarket/commit/4272bef) API, [985d13f](https://github.com/hasanackl/cropmarket/commit/985d13f) enum casing, [c2f3df7](https://github.com/hasanackl/cropmarket/commit/c2f3df7) web pages |
| Technical problems found | Vulnerable transitive package; TypeScript 7 peer conflict with typescript-eslint; enum casing mismatch between client and API. |
| Solutions applied | Direct reference to the patched package; TypeScript pinned to 6.0; camelCase enum converter. |
| References consulted | Microsoft Learn: JWT bearer authentication, EF Core migrations, user secrets, .NET support policy; Vite and React documentation. |
| Report sections updated | 17 Implementation, 18 Development Process; revised Sections 4, 14 and 16. |
| Week 5 objective | Place an order, reduce stock safely and update the order status (FR-04, FR-05, FR-06). |