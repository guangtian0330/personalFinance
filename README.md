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

`M00-BOOTSTRAP-000` established the repository structure and working protocol.
`M00-01` adds a pnpm workspace and strict TypeScript compilation for six packages.
The entry modules are empty; there is no runnable web/API application, database
schema or CI pipeline yet. See [project status](docs/PROJECT-STATUS.md) for evidence.

The user designated [.ai/FinPath_Delivery2_v1](.ai/FinPath_Delivery2_v1/START-HERE.md)
as the source for the delivered PRD, architecture, algorithms and 53-Step task
order. Only `M00-01` is authorized in this session. Future tasks and proposed
business decisions require their own approval.

## Tentative technology direction

The preferred stack is TypeScript in strict mode, React + Vite, Hono, Drizzle,
SQLite-compatible Cloudflare D1, Zod, Vitest and Playwright. The intended
architecture is a modular monolith with explicit contracts and a testable,
platform-neutral domain core. This task establishes only the TypeScript/pnpm
foundation; framework and infrastructure setup belong to later authorized tasks.
Tauri and Taro may be evaluated for later platforms.

## Repository structure

```text
apps/web/               Future responsive web application
apps/api/               Future API adapter
packages/core/         Future platform-neutral domain logic
packages/contracts/    Future shared contracts and validation
packages/persistence/  Future persistence adapters
packages/ui/           Future shared UI components
.ai/FinPath_Delivery2_v1/docs/   Delivered specifications and proposed decisions
.ai/FinPath_Delivery2_v1/tasks/  Authoritative Step order and specifications
docs/PROJECT-STATUS.md Current state, blockers and verification evidence
tasks/                 Navigation to the delivery task index
tests/                 M00-01 workspace/compiler verification
AGENTS.md              Repository-wide agent protocol
```

The root specification directories retain their bootstrap placeholders; the
delivered documents remain in `.ai/FinPath_Delivery2_v1/` rather than being copied.

## Windows development setup

Pinned tooling: Node **24.22.1** (`.node-version`), pnpm **11.25.0**
(`packageManager`), TypeScript **6.0.3** (exact dependency and lockfile).
The supported Node engine is `>=24.22.1 <25`; use the pin for reproducible work.
Node 20 is not supported. Node 24 is an LTS release line; see the
[Node release table](https://nodejs.org/en/about/previous-releases).

If you use fnm, select the pinned Node version in PowerShell:

```powershell
fnm env --shell power-shell | Out-String | Invoke-Expression
fnm install 24.22.1
fnm use 24.22.1
```

Use pnpm 11.25.0. If it is not installed, `npm install --global pnpm@11.25.0`
installs that exact version; this global install was not performed by M00-01.
Then, from the repository root:

```powershell
node --version
pnpm --version
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
pnpm test
```

`typecheck` and `build` both run the composite TypeScript compiler. They emit
JavaScript, declarations and incremental metadata into each package's ignored
`dist/` directory so references work from a fresh checkout. This is compilation,
not an application bundle or deployment. `test` builds its prerequisites and runs
the focused M00-01 checks with Node's test runner, including negative type cases.
Lint/format tooling, Vitest, Playwright and CI belong to M00-05 and are not set up.

Workspace dependencies use `workspace:*` and matching TypeScript references.
The core package has no dependencies, browser globals or Node ambient types.
Only web/UI packages opt into DOM types. See
[pnpm workspaces](https://pnpm.io/workspaces) and
[TypeScript project references](https://www.typescriptlang.org/docs/handbook/project-references.html).

## Resuming work

Read [AGENTS.md](AGENTS.md), [project status](docs/PROJECT-STATUS.md) and the
[delivery task index](.ai/FinPath_Delivery2_v1/tasks/INDEX.md). The next suggested
task is `M00-02`; request it explicitly in a fresh session. Read only its required
sources and relevant code. A delivered file is not permission to execute it.

The local project remains at `D:\myWORK\project\finpath`. A separate Windows
environment task configured fnm's persistent default as Node 24.22.1 and pnpm
11.25.0 while preserving Node 20. M00-01 delivery checks pass in the normal
PowerShell environment. Other checkouts should select the pinned versions above.

Use synthetic financial fixtures only. Keep credentials, real financial data,
imports, exports, databases and backups out of Git. Production release requires
authentication, tenant authorization, privacy and backup/restore verification.
