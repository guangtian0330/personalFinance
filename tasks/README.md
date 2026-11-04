# FinPath task index

## Current work

| Task | State | Approval / evidence |
| --- | --- | --- |
| `M00-BOOTSTRAP-000` | Verified | Authorized by the user's master-prompt request; skeleton and documentation checks passed; see project status |
| `M00-01` | Integrated | PR #1 merged to `main` on 2026-11-03; verified Windows install, frozen lockfile, compile and 7/7 focused tests |
| `M00-02` | Integrated; human UX PASS | PR #1 merged; Windows shared startup, 15/15 tests and real browser outage/retry passed. User confirmed UX acceptance on 2026-10-31. |
| `M00-03` | Integrated | PR #1 merged; implementation checks passed and user approved concrete API contract on 2026-10-31. |
| `M00-04` | Integrated | PR #1 merged; 48/48 tests, startup rejection and 18/18 live HTTP checks passed. Manual checkpoint WAIVED_BY_USER on 2026-11-01. |
| `M00-05` | Integrated | [PR #1](https://github.com/guangtian0330/personalFinance/pull/1), merge `844f81f51e2d2353811536bd95628542faedf301`; exact-SHA Ubuntu/Windows CI passed. |
| `M01-01` | Verified locally | Five focused money tests plus full regression/type/build/lint/format passed; branch/commit/PR/CI are recorded in project status after delivery. |

The user designated [Delivery2's task index](../.ai/FinPath_Delivery2_v1/tasks/INDEX.md)
as the source of task order and dependencies. Execute only the explicitly
requested Step and resolve its source links relative to that delivery directory.
See
[project status](../docs/PROJECT-STATUS.md) for command results and blockers.

## Candidate roadmap only

The summary below preserves the initial planning counts. Delivery2 now supplies
the 53 individual Step files; its index governs the order and dependencies.
Delivery of a specification is not blanket approval of the remaining roadmap.

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
5. Run the Step's checks, inspect diffs, update project status with actual
   evidence, report limitations and stop. A further Step requires a new explicit
   user instruction. Contract and migration changes need review gates.

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

## Permanent Git workflow

For each explicitly authorized Step: start from latest integrated `main`, create
one task branch, implement and verify the scoped change, commit once, push it,
create or reuse a PR targeting `main`, verify exact-SHA required CI, apply the
risk gate, report, and stop. Never force-push or automatically start the next
Step. Maintain the complete 53-Step status table and M00-M09 integration counts
in [project status](../docs/PROJECT-STATUS.md), with Integrated reserved for work
actually merged to `main`.

Automatic PR merge is allowed only when the Step is explicitly low risk and
eligible for automatic integration, all required checks pass, the PR has no
conflicts or unrelated changes, and no protected financial, security, database
or architecture contract is changed. Human merge approval is required for
financial algorithms/ledger invariants, goal priority/allocation, schemas and
migrations, authentication/authorization, security-sensitive work, destructive
data changes, or major architecture changes. Approval for one named PR does not
authorize another merge. Do not bypass branch protection or required checks.
