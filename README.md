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
`M00-02` adds a local React/Vite page that checks the Hono API and lets the
developer retry when the service is unavailable. See [project status](docs/PROJECT-STATUS.md).
`M00-03` adds shared Zod contracts, versioned health requests and typed errors;
implementation checks and the human contract review passed on 2026-10-31.

The user designated [.ai/FinPath_Delivery2_v1](.ai/FinPath_Delivery2_v1/START-HERE.md)
as the source for the delivered PRD, architecture, algorithms and 53-Step task
order. Each implementation Step requires its own authorization.

## Tentative technology direction

The preferred stack is TypeScript in strict mode, React + Vite, Hono, Drizzle,
SQLite-compatible Cloudflare D1, Zod, Vitest and Playwright. The intended
architecture is a modular monolith with explicit contracts and a testable,
platform-neutral domain core. The local Hono app exposes a Fetch handler. A
separate Node adapter starts the development listener on Windows.
Tauri and Taro may be evaluated for later platforms.

## Repository structure

```text
apps/web/               React/Vite web app and connectivity checks
apps/api/               Hono health route, local listener and route tests
packages/core/         Future platform-neutral domain logic
packages/contracts/    Shared Zod health/error contracts and validation
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

`typecheck` compiles the six TypeScript projects into their ignored `dist/`
directories. `build` also writes the web bundle to `apps/web/build/`. `test`
builds first, then runs workspace, API route and web connectivity checks with
Node's test runner, including M00-03 contract fixtures and inferred-type probes.
The lint/format, Vitest, Playwright and CI setup is planned
for M00-05.

Workspace dependencies use `workspace:*` and matching TypeScript references.
The core package has no dependencies, browser globals or Node ambient types.
Web/UI use DOM types for rendering. The API enables Fetch/Web API declarations
needed by Hono and Node types for its local listener. See
[pnpm workspaces](https://pnpm.io/workspaces) and
[TypeScript project references](https://www.typescriptlang.org/docs/handbook/project-references.html).
The contracts package enables DOM declarations for the standard `URL` type used
in Zod's declarations; it uses no browser-only runtime APIs. Core stays isolated.

## Run the local web app and API (M00-02)

From the repository root in PowerShell, run `pnpm dev` to start both services.
The root dev commands build shared contracts before starting either service.
Open [FinPath in the browser](http://127.0.0.1:5173/). The connection card
should show **服务已连接**. Vite forwards the browser's same-origin `/api/v1/health`
request to the API on loopback port 8787. To check both paths in another shell:

```powershell
(Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8787/api/v1/health).Content
(Invoke-WebRequest -UseBasicParsing http://127.0.0.1:5173/api/v1/health).Content
```

Both return HTTP 200 and `{"status":"ok","service":"finpath-api"}`. Press
`Ctrl+C` in the launching shell to stop the pair. If either port is occupied,
check which service owns it before starting FinPath.
The original `/health` path remains available. The stateless
`POST /api/v1/health/check` example accepts JSON `{"check":"health"}`;
invalid bodies or unknown query fields return typed 400 errors. See the
[approved M00-03 contract](.ai/FinPath_Delivery2_v1/docs/architecture/API.md#m00-03-foundation-contract)
for exact shapes, error codes and compatibility rules.

To check failure and recovery, start `pnpm dev:web` and `pnpm dev:api` in two
separate PowerShell terminals instead of using the shared launcher. With the
page open, press `Ctrl+C` in the API terminal, then choose **重新检查**. Expect
**暂时无法连接**. Run `pnpm dev:api` again and choose **重新检查** on the same
page. Expect **服务已连接**. Stop both commands with `Ctrl+C`. Human reviewers
record the revision, date, browser and outcome in the M00-02 UX checklist.

## Resuming work

Read [AGENTS.md](AGENTS.md), [project status](docs/PROJECT-STATUS.md) and the
[delivery task index](.ai/FinPath_Delivery2_v1/tasks/INDEX.md). M00-03 is locally
Verified with its contract approved. After its Git delivery and CI check,
the next suggested task is `M00-04`, requiring a new instruction. Read only the
current task's required sources and code. A delivered file is not permission to execute it.

The local project remains at `D:\myWORK\project\finpath`. A separate Windows
environment task configured fnm's persistent default as Node 24.22.1 and pnpm
11.25.0 while preserving Node 20. M00-01 delivery checks pass in the normal
PowerShell environment. Other checkouts should select the pinned versions above.

Use synthetic financial fixtures only. Keep credentials, real financial data,
imports, exports, databases and backups out of Git. Production release requires
authentication, tenant authorization, privacy and backup/restore verification.
