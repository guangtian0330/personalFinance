# personalFinance

## FinPath

FinPath is the working name of a goal-driven personal and household finance
application. The GitHub repository remains `personalFinance`; trademark
availability for the working name has not been verified.

The intended scope combines financial records (accounts, transactions, budgets,
assets and liabilities), goal planning, explainable funding recommendations,
forecasting and scenario comparisons. The initial target is a responsive web
application with a simple default experience and optional features. Windows
desktop and WeChat mini program support are possible later targets.

## Current stage

`M00-BOOTSTRAP-000` establishes the repository structure and working protocol.
There is no runnable application, dependency manifest, database schema or CI
pipeline yet. See [project status](docs/PROJECT-STATUS.md) for verified results.

The first product-planning delivery is a draft for review. The formal PRD,
architecture, algorithms and executable task specifications are still pending.
The 53 candidate roadmap steps are proposals, not approved implementation work.
The proposed maximum of three simultaneously funded top-level goals is also
subject to review.

## Tentative technology direction

The preferred stack is TypeScript in strict mode, React + Vite, Hono, Drizzle,
SQLite-compatible Cloudflare D1, Zod, Vitest and Playwright. The intended
architecture is a modular monolith with explicit contracts and a testable,
platform-neutral domain core. These choices are not approval to scaffold the
application. Tauri and Taro may be evaluated for later platforms.

## Repository structure

```text
apps/web/               Future responsive web application
apps/api/               Future API adapter
packages/core/         Future platform-neutral domain logic
packages/contracts/    Future shared contracts and validation
packages/persistence/  Future persistence adapters
packages/ui/           Future shared UI components
docs/requirements/     Reviewed PRD, feature catalog and flows when delivered
docs/architecture/     Architecture, boundaries, contracts, DB and security docs
docs/algorithms/       Algorithm registry, sources, assumptions and test vectors
docs/decisions/        Dated architecture decision records
docs/PROJECT-STATUS.md Current state, blockers and verification evidence
tasks/                 Task index and future approved Step specifications
tests/                 Future tests and synthetic fixtures
AGENTS.md              Repository-wide agent protocol
```

Empty directories contain `.gitkeep` files only. Their presence does not imply
that a specification or implementation exists.

## Resuming work

Read [AGENTS.md](AGENTS.md), [project status](docs/PROJECT-STATUS.md) and the
[task index](tasks/README.md). Obtain the reviewed formal documents and an
approved `M00-01` specification, then explicitly request that single Step in a
fresh session. Follow only its referenced documents and relevant code; do not
automatically advance to another Step.

The local project remains at `D:\myWORK\project\finpath`. No tools or packages
were installed for bootstrap. There are no application setup or run commands
until an approved foundation task creates them.

Use synthetic financial fixtures only. Keep credentials, real financial data,
imports, exports, databases and backups out of Git. Production release requires
authentication, tenant authorization, privacy and backup/restore verification.
