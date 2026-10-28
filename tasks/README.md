# FinPath task index

## Current work

| Task | State | Approval / evidence |
| --- | --- | --- |
| `M00-BOOTSTRAP-000` | Verified | Authorized by the user's master-prompt request; skeleton and documentation checks passed; see project status |
| `M00-01` | Proposed | Awaiting formal specification and human approval |

No executable feature-Step specification has been approved. The bootstrap
authorization does not authorize `M00-01` or any later task. See
[project status](../docs/PROJECT-STATUS.md) for command results and blockers.

## Candidate roadmap only

These 53 candidate Steps are planning counts, not executable task files.
Exact IDs, order, interfaces, scope and acceptance tests will be finalized in the
separate formal document delivery. Every milestone below remains Proposed.

| Milestone | Candidate Steps | Planned area |
| --- | ---: | --- |
| M00 Foundation | 5 | Strict TypeScript, web/API, contracts, local mock auth, CI/tests |
| M01 Ledger | 6 | Money, accounts/tenants, postings, API authorization, UI, reconciliation |
| M02 Budget | 5 | Categories, periods/versions, variance engine, UI, regressions |
| M03 Onboarding | 5 | Feature manifest, optional onboarding, recommendations, navigation, UX |
| M04 Goals | 6 | Goal models/templates, horizons, virtual funding, active cap, UI, consistency |
| M05 Allocation | 6 | Algorithm registry, scoring, safe cash flow, suggestions, confirmation, tests |
| M06 Forecasting | 5 | Recurring flows, scenarios, car/retirement transitions, integration |
| M07 Assets/Data | 5 | Net worth, FX valuation, import, export/backup/restore, reporting |
| M08 Authentication/Security | 5 | Production auth, sessions, tenant authorization, privacy, security E2E |
| M09 Integration/Release | 5 | Deployment preparation, full E2E, performance, recovery, readiness |
| Total | 53 | Candidate Steps; excludes the separate bootstrap task |

Proposed dependencies: foundation -> ledger -> budget; onboarding may partially
overlap only after contracts stabilize. Goals depend on ledger and budget;
allocation depends on goals and safe-cash-flow inputs; forecasting depends on
allocation. Security must pass before live-user release; integration/release is
last. Formal Step files must provide exact prerequisites.

## Formal Step workflow

1. Deliver and review the PRD, architecture, algorithms and contracts first.
2. Create one independently verifiable vertical slice per Step file, named using
   its approved ID, for example `<taskId>.md`. Do not invent missing business rules.
3. Include every required field below and record approval before execution.
4. Execute only the explicitly requested Step after prerequisites are verified.
   Read `AGENTS.md`, that Step and its referenced sources/relevant code only.
5. Run the Step's checks, inspect diffs, update this index and project status with
   actual evidence, report limitations and stop. A further Step requires a new
   explicit user instruction. Contract and migration changes need review gates.

Required fields: `taskId`, `milestone`, `goal`, `requirements`, `prerequisites`,
`sourceDocs`, `allowedFiles`, `protectedFiles`, `inputs`, `outputs`, `contracts`,
`invariants`, `implementationScope`, `outOfScope`, `testCommands`,
`acceptanceCriteria`, `completionReport`, `parallelizable`, `conflictRisk`.

The human-approved PRD governs product requirements, approved architecture/ADRs
govern technical choices, contracts govern interfaces and the approved Step
limits edit scope. Task files cannot silently override higher-level approvals.

Use these distinct states:

| State | Meaning |
| --- | --- |
| Proposed | Candidate work; not authorized to execute |
| Approved | Specification reviewed and explicitly approved |
| In Progress | Authorized work currently being performed |
| Blocked | A required specification, prerequisite or check prevents progress |
| Completed | Implementation/artifacts finished; verification still pending |
| Verified | Acceptance criteria checked with recorded evidence |

Keep bootstrap and financial ledger/domain-invariant work sequential. Later
parallel code-writing tasks require approved independent scope, disjoint file
ownership, stable contracts/tests and separate branches/worktrees, followed by
one integration review and complete tests.
