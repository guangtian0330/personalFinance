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
`M00-04` adds a default-deny auth boundary and an explicit local-only synthetic
identity. Its automatic checks passed; the user waived its manual checkpoint.
`M00-05` establishes Biome formatting/lint, Vitest API smoke, Playwright browser
smoke and a Windows/Linux CI workflow. Local verification and remote CI are
recorded separately in project status and the exact commit's Actions run.

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
packages/core/         Platform-neutral auth ports; future domain logic
packages/contracts/    Shared Zod health/error contracts and validation
packages/persistence/  Future persistence adapters
packages/ui/           Future shared UI components
.ai/FinPath_Delivery2_v1/docs/   Delivered specifications and proposed decisions
.ai/FinPath_Delivery2_v1/tasks/  Authoritative Step order and specifications
docs/PROJECT-STATUS.md Current state, blockers and verification evidence
tasks/                 Navigation to the delivery task index
tests/                 Workspace/compiler checks, harness probes and browser smoke
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
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
pnpm test
pnpm exec playwright install chromium
pnpm test:e2e
```

`typecheck` compiles the six TypeScript projects into their ignored `dist/`
directories. `build` also writes the web bundle to `apps/web/build/`. `test`
builds first, then runs the retained 48 Node regressions, Vitest API smoke and
isolated harness failure probes. The full command set is described below.

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

## Local authentication smoke (M00-04)

Normal startup keeps mock auth off. Public health still returns 200;
`GET /api/v1/private/health` returns the typed 401 `UNAUTHENTICATED` response.
To exercise the synthetic local identity, open a fresh PowerShell at the repo
root and explicitly opt in for that shell only:

```powershell
$env:APP_ENV = 'development'
$env:NODE_ENV = 'development'
$env:MOCK_AUTH = 'true'
pnpm dev
```

In another shell, check the direct and proxied protected routes:

```powershell
(Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8787/api/v1/private/health).Content
(Invoke-WebRequest -UseBasicParsing http://127.0.0.1:5173/api/v1/private/health).Content
```

Both return `{"status":"ok","service":"finpath-api"}`. The provider supplies
only the fixed synthetic actor/workspace; request fields cannot select another
identity. Use the documented `127.0.0.1` origins. Stop with Ctrl+C and close the
test shell to discard its flags. No persistent environment setting is changed.

Production/preview/staging or conflicting flags refuse to start mock mode.
The portable handler stays anonymous and rejects deployment bindings that try
to activate it. Do not expose local mock through public hosting or a tunnel.
See the exact [auth contract](.ai/FinPath_Delivery2_v1/docs/architecture/API.md#m00-04-local-authentication-boundary)
and [security boundary](.ai/FinPath_Delivery2_v1/docs/architecture/SECURITY.md#m00-04-local-mock-boundary).

## Test harness and CI (M00-05)

Run these commands from the repository root in PowerShell. All checks are
non-interactive and return nonzero on failure; no retry may hide a flaky check.

| Command | Scope |
| --- | --- |
| `pnpm format:check` / `pnpm format` | Check / apply Biome formatting to application/package code, tests and root JS/JSON config. Generated files and Delivery2 materials are excluded. |
| `pnpm lint` | Biome recommended rules, with warnings treated as errors. |
| `pnpm typecheck` / `pnpm build` | Strict six-package TypeScript compilation / compilation plus Vite web bundle. |
| `pnpm test` | Build, 48 retained Node regressions, three Vitest API checks, two harness checks. Includes production/preview/staging mock startup rejection. |
| `pnpm test:unit` | Vitest `*.vitest.test.ts` / `*.vitest.test.mjs` under apps, packages or tests; run build first for compiled workspace imports. |
| `pnpm test:regression` / `pnpm test:harness` | Existing Node suites / real runner, lint and formatter rejection probes; normally invoked by `pnpm test`. |
| `pnpm test:e2e` | Build and six Playwright Chromium cases across desktop and 390×844: connection, keyboard retry, outage/recovery and live direct/proxy API checks. |

Install the pinned browser once with `pnpm exec playwright install chromium`.
Linux CI uses `pnpm exec playwright install --with-deps chromium`. Playwright
starts the compiled API on `127.0.0.1:8787` and built web preview on
`127.0.0.1:4173`, using explicit development flags with MOCK_AUTH=false. It never
reuses an existing server and cleans up its own processes. Stop your dev server
before running E2E; an occupied port is an error, not permission to kill its owner.
The outage case aborts only that browser's request, then recovers through the
real proxy/API. It does not change the machine's network configuration.

HTML reports are local under ignored `playwright-report/`; failure traces and
screenshots go under ignored `test-results/`. View locally with
`pnpm exec playwright show-report`. Fixtures are synthetic. Temporary negative
probes are cleaned in `finally` and ignored if interrupted; they must never be
committed. Focused-only Vitest/Playwright tests and empty Vitest suites fail.

The [CI workflow](.github/workflows/ci.yml) runs the same gates on Ubuntu and
Windows for pushes and pull requests. It pins official Actions by commit,
reads Node/pnpm versions from the repository, uses a frozen install and only
`contents: read`. It has no deployment step, secrets or published test artifacts.
Both `verify (ubuntu-latest)` and `verify (windows-latest)` must succeed for the
exact delivered SHA. Adding this workflow does not configure remote branch
protection, imply a green run, or grant release approval.

Tool references: [Biome configuration](https://biomejs.dev/reference/configuration/),
[Vitest](https://vitest.dev/guide/) and
[Playwright web servers](https://playwright.dev/docs/test-webserver).

## Resuming work

Read [AGENTS.md](AGENTS.md), [project status](docs/PROJECT-STATUS.md) and the
[delivery task index](.ai/FinPath_Delivery2_v1/tasks/INDEX.md). M00-05 is locally
Verified; both exact-SHA CI matrix jobs must pass after push before closing M00.
The next suggested task is `M01-01`, requiring a new instruction. Read only the
current task's required sources and code. A delivered file is not permission to execute it.

The local project remains at `D:\myWORK\project\finpath`. A separate Windows
environment task configured fnm's persistent default as Node 24.22.1 and pnpm
11.25.0 while preserving Node 20. M00-01 delivery checks pass in the normal
PowerShell environment. Other checkouts should select the pinned versions above.

Use synthetic financial fixtures only. Keep credentials, real financial data,
imports, exports, databases and backups out of Git. Production release requires
authentication, tenant authorization, privacy and backup/restore verification.
