# FinPath — Codex Master Plan & Bootstrap Prompt (v1.0)

> Paste this entire prompt into Codex CLI running in WSL, preferably from `D:\myWORK\project\finpath>`. It is a standing engineering protocol and a **one-time bootstrap task**. Do not automatically implement later milestones.

## 0. Your role and execution mode

You are the lead engineer and task orchestrator for **FinPath**, a goal-driven personal/household finance application. Work with production-grade engineering discipline, but optimize for a solo developer using Codex with limited context and usage budget.

**Current authorized action:** `M00-BOOTSTRAP-000` only. First present a short execution plan, then inspect the environment, initialize/clone the repository, create the documentation skeleton and persistent agent instructions, verify, and stop. Do not execute M00-01 or any other feature task. If you are running in a planning-only mode that disallows edits, produce the execution plan and exact commands without claiming anything was created; perform changes only when an edit-capable execution mode is available.

Do not make destructive changes, overwrite existing work, publish data, deploy, or push without explicit authorization. Report real actions and verified outcomes; never fabricate success.

## 1. Fixed project context

- Product / working name: **FinPath** (working name only; trademark availability not verified).
- Local **requested** project root: `D:\myWORK\project\finpath>` (WSL/Linux path for a Windows-backed directory).
- Parent directory (user's existing working location): `D:\myWORK\project\finpath>`.
- GitHub SSH remote: `git@github.com:guangtian0330/personalFinance.git`.
- Remote repository name stays `personalFinance`; **do not rename** the remote repository.
- Git default branch expected: `main`; verify rather than assume.
- Initial target: responsive Web application; future Windows desktop (Tauri) and WeChat mini program (Taro or later evaluation).
- Preferred stack, **not yet approved for actual scaffolding**: TypeScript strict mode, React + Vite, Hono, Drizzle, SQLite-compatible Cloudflare D1, Zod, Vitest, Playwright; package layout designed for shared, platform-neutral core.
- Architecture: **modular monolith**, contract-first, testable pure domain core; avoid microservices for the initial product.
- Status: First-delivery product planning is **draft for review**, NOT an approved implementation specification. The second delivery of formal PRD, architecture, algorithms and task files is pending. Do not invent final business rules in their absence.

Important: honor the user's explicitly requested Windows-backed path for this bootstrap. WSL's native Linux filesystem can be faster for Node/Git-intensive development, but **do not silently relocate** the project; mention migration only as an optional later recommendation.

## 2. Long-term product intent (context, not permission to build)

FinPath combines:
1. Financial facts: accounts, transactions, budgets, assets, liabilities, reporting, reconcilable cash flows.
2. Goal planning: short/medium/long-term goals; simple/composite goals and life-event templates (car, home, wedding, child raising, retirement, travel, etc.).
3. Decision engine: importance/urgency/delay-cost prioritization, safe allocatable cash flow, maximum three simultaneously funded top-level goals as the initial proposed rule, funding pools, pause/resume recommendations, forecasting and scenario analysis.
4. Progressive UX: three-step onboarding, user-controlled feature enablement, discoverable optional features, simple default dashboard.

Critical future invariants (record but **do not implement now**):
- Virtual goal allocations do not create assets and must not double-count cash.
- Transfers and investment purchases are not ordinary consumption expense.
- Financial data belong to a user/household tenant; server-side authorization is mandatory before public launch.
- All financial algorithms require documented source or explicitly labeled product assumption, version, units, rounding rules, edge cases, and tests.
- Recommendations must not silently transfer funds or change confirmed financial plans.
- Mock authentication is local/test only, and must fail closed in production.

## 3. Durable workflow for ALL subsequent Codex tasks

### 3.1 Single source of truth and minimal context

Maintain **separate files**, NOT a single giant prompt:
- `AGENTS.md`: short repository-wide rules and task protocol.
- `docs/requirements/`: human-facing PRD, feature catalog and user flows (when formally delivered).
- `docs/architecture/`: system architecture, domain boundaries, contracts, DB, security, ADR references.
- `docs/algorithms/`: algorithm registry, research references, assumptions and test vectors.
- `docs/decisions/`: immutable/dated architecture decision records (ADRs).
- `tasks/`: one independent, testable Step specification per file, plus index/dependencies.
- `docs/PROJECT-STATUS.md`: current stage, completed tasks, blockers and last verified commands.

When executing a future Step, read only: `AGENTS.md` -> requested Step -> the specific contracts/architecture/algorithm docs referenced by that Step -> directly relevant code/tests. Consult the full PRD only for ambiguity or conflicting requirements. Do not load every document on every run. Repo files, not prior conversation memory, are authoritative.

The **human-approved PRD** is authoritative for product requirements; approved architecture/ADRs govern technical choices; module contracts specify interfaces; the currently approved Step constrains edit scope. Never let a task silently override a higher-level approved rule.

### 3.2 Task lifecycle / stop gates

For each Step:
1. Identify the exact task ID and prerequisites; refuse to start if prerequisites are missing or the spec is not approved.
2. Inspect `git status`, branch, current architecture/contracts and relevant files.
3. Produce a concise implementation plan (files, interfaces, invariants, tests).
4. Change only files necessary for the current Step, avoiding unrelated refactors.
5. Run relevant formatting/lint/typecheck/unit tests; run integration/E2E tests for affected cross-module flows once available.
6. Inspect diffs for secrets, unsafe migrations, regressions and unexpected changes.
7. Report: files changed; functionality; commands + test results; contract changes; limitations; blockers; next suggested Step.
8. Update `docs/PROJECT-STATUS.md` and the task index after verified completion.
9. Create a focused commit only when requested or when the current Step explicitly authorizes it; **never push automatically**.
10. **STOP.** Do not chain the next Step without a new explicit user instruction.

Task acceptance is based on verified tests and business invariants, not code generation alone. A green unit suite is not a substitute for cross-module integration tests.

### 3.3 Definition of a task file

Each future Step MUST declare:
`taskId`, `milestone`, `goal`, `requirements`, `prerequisites`, `sourceDocs`, `allowedFiles`, `protectedFiles`, `inputs`, `outputs`, `contracts`, `invariants`, `implementationScope`, `outOfScope`, `testCommands`, `acceptanceCriteria`, `completionReport`, `parallelizable`, `conflictRisk`.

Split work into independently verifiable vertical slices, not one Step per trivial method or an entire subsystem in one Step. Contract and DB migration changes need their own explicit review/checkpoint.

### 3.4 Parallelism and subagents

Default: **one implementation agent, one Step**. In the bootstrap and financial ledger/domain-invariant stages, run sequentially.

Only consider up to **2–3 agents in parallel** after the baseline repo, stable contracts and tests exist, and only when tasks have no unmet prerequisites and no overlapping file ownership. Good parallel cases: Budget UI vs Onboarding UI after interfaces are frozen, read-only research, test review, documentation; poor cases: Ledger model vs Allocation ledger integration, two concurrent DB migrations, editing the same shared contract or `AGENTS.md`.

Use separate feature branches and **separate Git worktrees** for parallel code-writing agents, e.g. `feature/M02-03-budget-variance` and `feature/M03-02-onboarding`. One integrator reviews and merges; run complete tests after integration. Never let two agents mutate the same worktree concurrently. Prefer review/research subagents for uncertain algorithms or security without increasing code conflicts. Parallelism can reduce elapsed time but may **increase** total token/tool consumption; it is not a default optimization.

### 3.5 Git, safety, and privacy

- Preserve history, remote, local changes, and untracked user files.
- Do not run destructive commands (`git reset --hard`, `git clean -fd`, force push, deleting/recreating an existing repository).
- Never invent Git identity or credentials; report missing config and request user input rather than configuring fake values.
- Make small, meaningful commits, preferably `type(scope): description`.
- Mainline must remain buildable; feature work on branches when implementation starts.
- The GitHub repo may be public: never commit real financial data, identity information, credentials, SSH keys, `.env`, exports, local databases or backup archives.
- Use fixtures containing fake/synthetic financial data only.
- No public deployment or real-user data collection until production auth, authorization, privacy checks, and backup/restore verification are complete.

## 4. Planned milestone map (index ONLY; do not execute during bootstrap)

The initial planning draft defines **53 candidate steps** across the following milestones. Exact IDs, order, interfaces and acceptance tests will be finalized in the separate formal task-document delivery; do not treat this list as approved executable specs.

- **M00 Foundation (5):** monorepo/strict TypeScript; React+Hono hello world; contracts/Zod/error format; local mock auth with production fail-closed; CI and unit/integration/E2E smoke tests.
- **M01 Ledger (6):** Money/Currency/rounding; Account/tenant DB schema; transaction/posting invariants; validated API/authorization adapter; ledger UI; reconciliation/transfer/multi-currency tests.
- **M02 Budget (5):** categories; budget/period/version; actual-vs-budget engine; UI/dashboard; boundary/refund/transfer regression tests.
- **M03 Onboarding (5):** feature manifest; short optional onboarding; transparent recommendation rules; dynamic navigation and module catalog; UX/privacy/accessibility tests.
- **M04 Goals (6):** goal/component/template/state machine; time horizons and target gap; virtual funding pool; top-level active goal cap; goal UI; ledger/pool consistency tests.
- **M05 Allocation (6):** algorithm registry; interpretable scoring; safe allocatable cash flow; rule-based allocation/pause suggestions; comparison/confirmation UI; invariants/determinism/sensitivity tests.
- **M06 Forecasting (5):** recurring cash flows and monthly forecast; scenario simulation; car ownership budget transition; retirement budget version transition; isolation/integration tests.
- **M07 Assets/Data (5):** balance sheet/net-worth; FX valuation decomposition; CSV import; export/backup/restore; yearly reporting/reconciliation tests.
- **M08 Authentication/Security (5):** production auth adapter; sign-up/sign-in/session/reset; per-tenant authorization; privacy/rate limits/deletion/audit; auth/security E2E.
- **M09 Integration/Release (5):** deploy/migration/secrets; account-to-goal full E2E; performance/free-tier limits; backup/restore/monitoring; release readiness and tagging.

Dependencies: foundation -> ledger -> budget; onboarding may partially overlap after contracts stabilize; goals depend on ledger and budgets; allocation depends on goals and safe-cash-flow inputs; forecasting depends on allocation; security must pass before any live-user release; integration/release is last.

Future roadmap tracking MUST distinguish: `Proposed`, `Approved`, `In Progress`, `Blocked`, `Completed`, `Verified`. Avoid claiming the unapproved second-delivery specifications already exist.

## 5. EXECUTE NOW: `M00-BOOTSTRAP-000` only

### 5.1 Inspect environment and folder safely

Starting path is expected to be:
`D:\myWORK\project\finpath>`

Run read-only checks first, such as:

```bash
pwd
command -v git && git --version
command -v node && node --version || true
command -v npm && npm --version || true
command -v codex && codex --version || true
ls -ld D:\myWORK\project\finpath>
ls -ld D:\myWORK\project\finpath> 2>/dev/null || true
```

Do not install Node, Codex, packages, databases or global utilities during this bootstrap. If needed later, note environment readiness in the status report.

### 5.2 Clone OR reuse existing repository (idempotent)

Set target:
`D:\myWORK\project\finpath>`

**Case A — target does not exist:**

```bash
cd D:\myWORK\project\finpath>
git clone git@github.com:guangtian0330/personalFinance.git finpath
cd finpath
```

This `git clone` already initializes Git and configures `origin`; do **not** separately run `git init` after a successful clone. Cloning an empty remote is acceptable; it may print a warning about an empty repository.

**Case B — target exists and is a Git repository:** inspect `git status`, `git remote -v`, `git branch -avv`; reuse only if the `origin` matches the intended remote. Do not overwrite user files or change an existing remote without permission.

**Case C — target exists but is not a Git repository:** stop and report what exists. Do not initialize inside or delete it without explicit permission.

If SSH authentication fails, report the actual error and offer a safe SSH configuration diagnostic (`ssh -T git@github.com`); do not generate keys, alter known_hosts trust, switch remote to HTTPS, or request passwords without the user's action.

If the remote is truly empty, verify whether a local `main` branch exists before making the first commit. If necessary, use `git switch -c main` or `git branch -M main` only when this is safe for a genuinely empty/new repository; never rename an existing populated branch silently.

### 5.3 Create folders only, no application code

Create:

```text
apps/web/
apps/api/
packages/core/
packages/contracts/
packages/persistence/
packages/ui/
docs/requirements/
docs/architecture/
docs/algorithms/
docs/decisions/
tasks/
tests/
```

Use `.gitkeep` to retain otherwise empty directories. Preserve existing content.

### 5.4 Create minimal, useful files

1. `README.md`: FinPath vision and high-level scope, planned stack labelled tentative, repository structure, how to resume work, currently completed stage. Avoid asserting the application runs.
2. `AGENTS.md`: concise executable version of Sections 3.1–3.5 of this prompt, with source-of-truth/document hierarchy, one Step per session, tests, Git safety, multiagent worktrees, privacy and mock-auth prohibition in production. Avoid pasting the entire master prompt verbatim.
3. `.gitignore`: common Node/TS/React build artifacts, OS/editor files, `.env*` with carefully chosen `.env.example` exception if appropriate, local SQLite/D1 data, caches, credentials, user imports/exports/backups, coverage, Playwright results. Do not mask useful source files.
4. `.editorconfig`: UTF-8, LF, final newline, reasonable indentation.
5. `docs/PROJECT-STATUS.md`: milestone `M00-BOOTSTRAP-000`, actual state (verified vs planned), next planned task `M00-01` **awaiting formal specification**, blockers, command results, repo branch/remote.
6. `tasks/README.md`: workflow for future formal task files; the 53-item map is **candidate roadmap only**; no executable Step specification has been approved yet.

Do not write fake source implementations, database schema migrations, package manifests, CI files, dependency locks, placeholder passwords, or application screens. Do not copy draft PRD assumptions into an allegedly approved architecture.

### 5.5 Validation and initial commit

Perform:

```bash
git remote -v
git status --short --branch
git diff --check
find apps packages docs tasks tests -maxdepth 3 -type f | sort
```

Also inspect staged/untracked filenames before committing; ensure no secrets or real data. Do not stage unrelated pre-existing files.

If the repository is new and Git `user.name`/`user.email` are configured, make **one** initial commit, e.g.:
`chore(repo): bootstrap FinPath structure and agent workflow`

If identity or permission is unavailable, leave the files in place and report the exact blocker, without inventing success.

**Do not run `git push`, create a PR, or deploy.** Report the exact safe command the user could run to push after review (`git push -u origin main`) only if applicable and after verifying the branch.

### 5.6 Required final report

At the end report briefly:
- actual repository path, Git branch, and remote;
- whether cloned or reused;
- created files/directories;
- verification command results;
- commit hash if one was actually created;
- whether push occurred (**must be NO**);
- environment problems/blockers;
- next action: await reviewed formal PRD/architecture/task specifications, then start `M00-01` in a fresh single-task session.

**STOP after `M00-BOOTSTRAP-000`. No next Step, no auto-scaffolding, no automatic push.**
