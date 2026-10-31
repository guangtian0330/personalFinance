# Codex task index — 53 planned steps

**One Step per Codex session**, explicitly authorized by user. Previous M00-BOOTSTRAP-000 is complete and not part of the 53.

| Task | Purpose | Prerequisites | Parallel allowed? |
|---|---|---|---|
| [M00-01](M00/M00-01.md) | Initialize pnpm workspace and strict TypeScript | M00-BOOTSTRAP-000 | No |
| [M00-02](M00/M00-02.md) | Scaffold Web and Hono API smoke | M00-01 | No |
| [M00-03](M00/M00-03.md) | Contract package + typed errors | M00-02 | No |
| [M00-04](M00/M00-04.md) | Auth adapter interface with dev-only mock | M00-03 | No |
| [M00-05](M00/M00-05.md) | CI, formatting and test harness | M00-04 | No |
| [M01-01](M01/M01-01.md) | Money, currencies, scales and rounding | M00-05 | No |
| [M01-02](M01/M01-02.md) | Accounts and tenant-aware base schema | M01-01 | No |
| [M01-03](M01/M01-03.md) | Balanced journal and reversal domain | M01-02 | No |
| [M01-04](M01/M01-04.md) | Ledger REST endpoints and idempotency | M01-03 | No |
| [M01-05](M01/M01-05.md) | Accounts and transactions UI | M01-04 | No |
| [M01-06](M01/M01-06.md) | Ledger reconciliation and currency regression suite | M01-05 | No |
| [M02-01](M02/M02-01.md) | Default financial category trees | M01-06 | No |
| [M02-02](M02/M02-02.md) | Budget period/version domain | M02-01 | No |
| [M02-03](M02/M02-03.md) | Budget actual and variance query | M02-02 | No |
| [M02-04](M02/M02-04.md) | Budget UI and monthly overview | M02-03 | No |
| [M02-05](M02/M02-05.md) | Budget/ledger cross-module regression | M02-04 | No |
| [M03-01](M03/M03-01.md) | Feature manifest and dependency policy | M00-05, M02-05 | No |
| [M03-02](M03/M03-02.md) | Three-screen skippable onboarding | M03-01 | No |
| [M03-03](M03/M03-03.md) | Explainable module recommendations | M03-02 | No |
| [M03-04](M03/M03-04.md) | Personalized dashboard/navigation | M03-03 | No |
| [M03-05](M03/M03-05.md) | Onboarding E2E, privacy and a11y | M03-04 | No |
| [M04-01](M04/M04-01.md) | Goal aggregate and lifecycle state machine | M02-05 | No |
| [M04-02](M04/M04-02.md) | Deadline horizon and monthly gap | M04-01 | No |
| [M04-03](M04/M04-03.md) | Virtual goal reservation event ledger | M04-02, M01-06 | No |
| [M04-04](M04/M04-04.md) | Atomic 3-active-goal limit and lifecycle APIs | M04-03 | No |
| [M04-05](M04/M04-05.md) | Goal creation and management UI | M04-04 | No |
| [M04-06](M04/M04-06.md) | Funding pools + ledger integration gate | M04-05 | No |
| [M05-01](M05/M05-01.md) | Algorithm registry and decision trace schema | M04-06 | No |
| [M05-02](M05/M05-02.md) | Priority score and urgency evidence | M05-01 | No |
| [M05-03](M05/M05-03.md) | Safe allocatable monthly cash and risk labels | M05-02, M02-05 | No |
| [M05-04](M05/M05-04.md) | Deterministic constrained goal allocation rules | M05-03, M04-06 | No |
| [M05-05](M05/M05-05.md) | Plan comparison, confirm and decision history UI | M05-04 | No |
| [M05-06](M05/M05-06.md) | Algorithm properties and end-to-end allocation gate | M05-05 | No |
| [M06-01](M06/M06-01.md) | Recurring income, expenses and monthly cash forecast | M05-06 | No |
| [M06-02](M06/M06-02.md) | Detached scenario simulation | M06-01 | No |
| [M06-03](M06/M06-03.md) | Car-purchase transition to recurring operating costs | M06-02 | No |
| [M06-04](M06/M06-04.md) | Retirement transition budget preview | M06-03 | No |
| [M06-05](M06/M06-05.md) | Scenario vs official plan integration gate | M06-04 | No |
| [M07-01](M07/M07-01.md) | Assets/liabilities/net worth historical views | M06-05 | No |
| [M07-02](M07/M07-02.md) | FX snapshots and performance disclosures | M07-01 | No |
| [M07-03](M07/M07-03.md) | CSV import dry-run and duplicate detection | M07-02 | No |
| [M07-04](M07/M07-04.md) | JSON/CSV export and safe restore validation | M07-03 | No |
| [M07-05](M07/M07-05.md) | Annual summary and import/export regression gate | M07-04 | No |
| [M08-01](M08/M08-01.md) | Select and validate real authentication adapter | M07-05 | No |
| [M08-02](M08/M08-02.md) | Registration/login/logout/password recovery | M08-01 | No |
| [M08-03](M08/M08-03.md) | Resource-level tenant isolation and roles | M08-02 | No |
| [M08-04](M08/M08-04.md) | Rate limits, retention/deletion and audit controls | M08-03 | No |
| [M08-05](M08/M08-05.md) | Security regression and release authorization gate | M08-04 | No |
| [M09-01](M09/M09-01.md) | Reproducible preview deployment and migrations | M08-05 | No |
| [M09-02](M09/M09-02.md) | Full accounting-to-goal E2E acceptance | M09-01 | No |
| [M09-03](M09/M09-03.md) | Cloud quota/performance and stress evaluation | M09-02 | No |
| [M09-04](M09/M09-04.md) | Backup/recovery and operations handbook | M09-03 | No |
| [M09-05](M09/M09-05.md) | Final release review and version tag proposal | M09-04 | No |

## Execution status

| Task | State | Evidence |
|---|---|---|
| M00-01 | Verified — 2026-10-30 | Explicit user authorization; Windows pnpm install/frozen lockfile, TypeScript build/typecheck and 7/7 focused checks passed; root `docs/PROJECT-STATUS.md` records details |
| M00-02 | Planned / authorization required | Next suggested Step; not executed |

All other Steps remain planned and require their own explicit authorization.

## Runtime discipline

Do not read the whole index plus all tasks into the model; read the one requested row, then that Step file, referenced docs, relevant code. Most dependencies are strict serial. Future parallel approvals require actual disjoint owned files, separate worktrees and integrator validation; `Parallel allowed` means potentially permitted, not an instruction to parallelize.

User issues `Execute Mxx-yy only`. Stop after tests and evidence. Status is recorded in existing `docs/PROJECT-STATUS.md`; do not infer completion from file existence.
