# Week 7 – Reproducibility, Installation and Integration

| Field | Response |
|-------|----------|
| Student | Hasan Açıkel |
| Project title | CropTrader – A Web Marketplace Connecting Farmers and Consumers |
| Tasks planned | Verify the integrated system end to end; document dependencies with tested versions; pin the toolchain; write an installation guide; reproducibility test from a fresh clone; fix real problems; Development Stage 5; README and report update. |
| Tasks completed | All planned tasks. End-to-end use case E1–E8 passed; [dependencies](../installation/dependencies.md) and [installation guide](../installation/installation-guide.md) written; `global.json`, `dotnet-tools.json`, `.nvmrc`, `.env.example` added; secret scan of 43 commits clean; fresh-clone test R01–R08 passed; one problem (npm audit warnings) fixed and retested. |
| GitHub commits | [9d44829](https://github.com/hasanackl/cropmarket/commit/9d44829), [e1c0b11](https://github.com/hasanackl/cropmarket/commit/e1c0b11), [3a8ca19](https://github.com/hasanackl/cropmarket/commit/3a8ca19), [b92ed55](https://github.com/hasanackl/cropmarket/commit/b92ed55) (fix) |
| Problems encountered | 9 moderate `npm audit` warnings in the fresh clone (minimatch via eslint/typescript-eslint), also shown as solution build warnings. The tester once started the API from the wrong folder. PowerShell 5.1 transcripts did not record command output. |
| Solutions attempted | `npm audit fix` and retest (0 vulnerabilities, 0 build warnings); the guide now says to run all commands in the new folder; terminal output copied from the console. |
| References consulted | Microsoft Learn: global.json overview, .NET local tools, safe storage of app secrets (user secrets), SQL Server Express LocalDB, EF Core migrations; npm Docs: `npm ci`, `npm audit`; Vite: env variables and modes. |
| Tests / checks performed | E1–E8 integration; R01–R08 reproducibility; `dotnet test` 39/39; `npm audit`, `npm run lint`, `npm run build`, `dotnet build CropMarket.slnx` before and after the fix. Evidence in [evidence/week-07](../../evidence/week-07/). |
| Report sections updated | 17 Implementation (system integration), 18 Development Process (Stage 5), 19 Testing (reproducibility and integration testing), new chapter Installation and Deployment, References. |
| Next week plan | Week 8: final report and professional README; two-decimal rule for listing quantities; browser measurement of the search time. |

Details: [Development stage 5](../development-stage-5.md) · [Reproducibility results](../testing/reproducibility-results.md)
