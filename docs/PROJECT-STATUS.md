# FinPath project status

Updated: 2026-11-03 (America/Toronto).

## Current stage

- Task: `M01-01` — Money, currencies, scales and rounding. M00-05 is integrated.
- M01-01 state: Delivered. User-approved representation/rounding design review
  is recorded; PR #2 merge still requires human approval under the high-risk policy.
- Prerequisite: M00-04 verified and delivered as
  `ddddf52ce623e5fa3f6dcef8bb6207037105da44` to
  `origin/codex/m00-04-auth-boundary` on 2026-11-02. Local, upstream and
  remote refs matched; exact-SHA status/check/workflow lists were empty before
  CI setup. Its manual waiver and M00-02 human UX PASS remain recorded below.
- Specification source and task order: `.ai/FinPath_Delivery2_v1/`, as designated
  by the user. Step source links are relative to that directory. This delivery
  remains a proposed baseline except for the explicitly authorized current work.
- Git delivery: this M00-05 task commit includes local evidence; actual SHA,
  push and CI results are reported after delivery. M00 closure requires both
  exact-SHA `verify (ubuntu-latest)` / `verify (windows-latest)` jobs to succeed.
- Next suggested task: `M01-02` after M01-01 PR review and integration; not executed.

## Permanent progress checklist and full Step status

Updated: 2026-11-03 (America/Toronto). `M00-BOOTSTRAP-000` is complete and is
outside the 53 Steps. Status meanings: Pending, In Progress, Blocked, Failed,
Verified (required local gates), Delivered (verified, committed, pushed and PR
created), Integrated (merged to main). The exact SHA, PR, push and CI evidence
for current work is recorded below and in the completion report; unknown commit
SHAs are not written into their own commit.

| Milestone | Area | Integrated |
| --- | --- | ---: |
| M00 | Foundation | 5/5 Integrated |
| M01 | Ledger | 0/6 Integrated |
| M02 | Budget | 0/5 Integrated |
| M03 | Onboarding | 0/5 Integrated |
| M04 | Goals | 0/6 Integrated |
| M05 | Allocation | 0/6 Integrated |
| M06 | Forecasting | 0/5 Integrated |
| M07 | Assets / Data | 0/5 Integrated |
| M08 | Authentication / Security | 0/5 Integrated |
| M09 | Integration / Release | 0/5 Integrated |

### All 53 planned Steps

| Task | Title | Dependencies | Status | Evidence |
| --- | --- | --- | --- | --- |
| M00-01 | Initialize pnpm workspace and strict TypeScript | M00-BOOTSTRAP-000 | Integrated | PR #1 merged to main (2026-11-03) |
| M00-02 | Scaffold Web and Hono API smoke | M00-01 | Integrated | PR #1 merged to main (2026-11-03) |
| M00-03 | Contract package + typed errors | M00-02 | Integrated | PR #1 merged to main (2026-11-03) |
| M00-04 | Auth adapter interface with dev-only mock | M00-03 | Integrated | PR #1 merged to main (2026-11-03) |
| M00-05 | CI, formatting and test harness | M00-04 | Integrated | PR #1 merged to main (2026-11-03) |
| M01-01 | Money, currencies, scales and rounding | M00-05 | Delivered | `codex/m01-01`, implementation `6b7282cec200724a89e89662a2fea14b70d72910`; [PR #2](https://github.com/guangtian0330/personalFinance/pull/2); exact-SHA CI pending |
| M01-02 | Accounts and tenant-aware base schema | M01-01 | Pending | Not started |
| M01-03 | Balanced journal and reversal domain | M01-02 | Pending | Not started |
| M01-04 | Ledger REST endpoints and idempotency | M01-03 | Pending | Not started |
| M01-05 | Accounts and transactions UI | M01-04 | Pending | Not started |
| M01-06 | Ledger reconciliation and currency regression suite | M01-05 | Pending | Not started |
| M02-01 | Default financial category trees | M01-06 | Pending | Not started |
| M02-02 | Budget period/version domain | M02-01 | Pending | Not started |
| M02-03 | Budget actual and variance query | M02-02 | Pending | Not started |
| M02-04 | Budget UI and monthly overview | M02-03 | Pending | Not started |
| M02-05 | Budget/ledger cross-module regression | M02-04 | Pending | Not started |
| M03-01 | Feature manifest and dependency policy | M00-05, M02-05 | Pending | Not started |
| M03-02 | Three-screen skippable onboarding | M03-01 | Pending | Not started |
| M03-03 | Explainable module recommendations | M03-02 | Pending | Not started |
| M03-04 | Personalized dashboard/navigation | M03-03 | Pending | Not started |
| M03-05 | Onboarding E2E, privacy and a11y | M03-04 | Pending | Not started |
| M04-01 | Goal aggregate and lifecycle state machine | M02-05 | Pending | Not started |
| M04-02 | Deadline horizon and monthly gap | M04-01 | Pending | Not started |
| M04-03 | Virtual goal reservation event ledger | M04-02, M01-06 | Pending | Not started |
| M04-04 | Atomic 3-active-goal limit and lifecycle APIs | M04-03 | Pending | Not started |
| M04-05 | Goal creation and management UI | M04-04 | Pending | Not started |
| M04-06 | Funding pools + ledger integration gate | M04-05 | Pending | Not started |
| M05-01 | Algorithm registry and decision trace schema | M04-06 | Pending | Not started |
| M05-02 | Priority score and urgency evidence | M05-01 | Pending | Not started |
| M05-03 | Safe allocatable monthly cash and risk labels | M05-02, M02-05 | Pending | Not started |
| M05-04 | Deterministic constrained goal allocation rules | M05-03, M04-06 | Pending | Not started |
| M05-05 | Plan comparison, confirm and decision history UI | M05-04 | Pending | Not started |
| M05-06 | Algorithm properties and end-to-end allocation gate | M05-05 | Pending | Not started |
| M06-01 | Recurring income, expenses and monthly cash forecast | M05-06 | Pending | Not started |
| M06-02 | Detached scenario simulation | M06-01 | Pending | Not started |
| M06-03 | Car-purchase transition to recurring operating costs | M06-02 | Pending | Not started |
| M06-04 | Retirement transition budget preview | M06-03 | Pending | Not started |
| M06-05 | Scenario vs official plan integration gate | M06-04 | Pending | Not started |
| M07-01 | Assets/liabilities/net worth historical views | M06-05 | Pending | Not started |
| M07-02 | FX snapshots and performance disclosures | M07-01 | Pending | Not started |
| M07-03 | CSV import dry-run and duplicate detection | M07-02 | Pending | Not started |
| M07-04 | JSON/CSV export and safe restore validation | M07-03 | Pending | Not started |
| M07-05 | Annual summary and import/export regression gate | M07-04 | Pending | Not started |
| M08-01 | Select and validate real authentication adapter | M07-05 | Pending | Not started |
| M08-02 | Registration/login/logout/password recovery | M08-01 | Pending | Not started |
| M08-03 | Resource-level tenant isolation and roles | M08-02 | Pending | Not started |
| M08-04 | Rate limits, retention/deletion and audit controls | M08-03 | Pending | Not started |
| M08-05 | Security regression and release authorization gate | M08-04 | Pending | Not started |
| M09-01 | Reproducible preview deployment and migrations | M08-05 | Pending | Not started |
| M09-02 | Full accounting-to-goal E2E acceptance | M09-01 | Pending | Not started |
| M09-03 | Cloud quota/performance and stress evaluation | M09-02 | Pending | Not started |
| M09-04 | Backup/recovery and operations handbook | M09-03 | Pending | Not started |
| M09-05 | Final release review and version tag proposal | M09-04 | Pending | Not started |

## M00-05 integration and M01-01 verification

M00-05 PR [#1](https://github.com/guangtian0330/personalFinance/pull/1) was
merged to `main` after the pushed branch SHA `dd90ac5637222dacb0d7c9b07897d56d36ae2b15`
passed both Ubuntu and Windows CI jobs with no conflicts. Merge commit:
`844f81f51e2d2353811536bd95628542faedf301`; local `main` fast-forwarded to the
same `origin/main` SHA. All five M00 Steps are included in that integration.

M01-01 uses the approved policy: internal `bigint` minor units; exact major-unit
decimal-string input (no implicit rounding); CAD/CNY scale 2 and JPY scale 0;
JSON minor units as canonical integer strings; SQLite signed int64 bounds;
same-currency-only arithmetic; conversion rounding half away from zero. Manual
review for this concrete representation/rounding design was approved by the user.
Because M01-01 changes financial primitives, its PR merge remains subject to a
separate human merge approval. No schema, migration, API contract or live data
changed.

| Check (Windows PowerShell, Node 24.22.1, pnpm 11.25.0) | Result |
| --- | --- |
| `pnpm format:check` | Exit 0; 49 files formatted, no changes required. |
| `pnpm lint` | Exit 0; 50 files, no warnings. Initial run found two prohibited non-null assertions; fixed and rerun successfully. |
| `pnpm typecheck` | Exit 0; all workspace TypeScript references compile. |
| `pnpm test` | Exit 0; 48/48 regression, 8/8 Vitest (including 5 M01-01), 2/2 harness; zero failed/skipped/cancelled. Includes TypeScript and web production build. |
| `pnpm build` | Exit 0; TypeScript project build and Vite production bundle. |
| Money vectors | CAD 1.23→123, CNY 1.23→123, JPY 123→123; mixed-currency rejection; ±0.5 ties round away from zero; safe-number and both int64 boundaries checked. |
| E2E | Not run: core-only primitives have no UI/API consumer; existing E2E boundaries are unaffected. |

M01-01 local verification and delivery are complete: commit
`6b7282cec200724a89e89662a2fea14b70d72910` was pushed to `origin/codex/m01-01`
and PR [#2](https://github.com/guangtian0330/personalFinance/pull/2) targets
`main`. Exact-SHA CI is running; its current report is `PUSHED_CI_PENDING`. PR
is mergeable with no conflict, but human approval is required due to financial
primitives. No M01-02 work has started.

## M00-05 local verification and CI gate

Authorized by "继续执行下一个task" on 2026-11-02. Branch
`codex/m00-05-test-harness`, based on the delivered M00-04 SHA above. The tracked
tree was clean; pre-existing untracked Delivery2 sources and ZIP remain excluded.
One implementation writer and a read-only reviewer were used.

Added root Biome/Vitest/Playwright configs, pinned dev dependencies/lockfile,
test scripts, API/browser smoke, isolated failure probes and the CI workflow.
Formatting establishes a baseline for existing code/tests without changing
contracts or financial behavior. The only explanatory source comment preserves
the deliberate `attempt` dependency that triggers the existing retry effect.
Necessary support paths include root configs, tests, ignore rules and docs.

Local checks ran from `D:\myWORK\project\finpath` in Windows PowerShell with
Node 24.22.1, pnpm 11.25.0, TypeScript 6.0.3, Biome 2.6.4, Vitest 5.0.0,
Playwright 1.64.1 and its Chromium 156.0.8078.4 (build 1248).

| Command / assigned B, L0–L3 check | Observed result |
| --- | --- |
| `pnpm install --frozen-lockfile --offline --reporter=append-only` | Exit 0; post-install lock SHA-256 remains `D74C1B596E7B92A3CDFAB15D47D13FF377E7377B5BCBB96A06FF7EE6BEBC65F1`. |
| `pnpm format:check` / `pnpm lint` | Exit 0; 47 formatted / 48 linted files. Recommended lint rules enabled; warnings fail. |
| `pnpm typecheck` | Exit 0; all six package references, including core platform isolation. |
| `pnpm test` (build plus all three suites) | Exit 0: 48/48 prior Node regressions, 3/3 Vitest API smoke, 2/2 harness tests; zero failed/skipped/cancelled. |
| Existing M00-04 source/compiled startup regression | All 12 unsafe configurations still exit before listening, including production/preview/staging mock requests. |
| Isolated harness fixtures | Actual Vitest assertion failure and focused-only test return 1; actual lint debugger and malformed-format fixtures return 1; corrected lint/format fixtures return 0. Temporary files removed in `finally`. |
| `pnpm exec playwright install chromium` | Exit 0; pinned browser downloaded from Playwright's official CDN to its standard user cache. |
| `pnpm test:e2e` (build plus Chromium) | Exit 0, 6/6 at desktop and 390×844: real connection/keyboard retry, intercepted outage then real recovery, direct/proxied 200/400/401. Zero retries/skips. |
| Loopback listener inspection after E2E | No listeners remain on 4173, 5173 or 8787. Test process env fixes development mode and MOCK_AUTH=false; no persistent settings changed. |
| Read-only implementation/workflow review | No blocker; 16 formatted pre-existing TS/JS/TSX files have equivalent transpiled runtime ASTs. |
| Staged delivery audit | 34 explicit task files; 83 tracked local links and 12 anchors resolve; index matches working files, whitespace/diff and credential-pattern checks pass. Unrelated untracked material excluded. |

The first pnpm command inside the sandbox hit its external-store symlink
restriction; the approved native retry succeeded. The initially queried Vitest
5.1.0 had just been released and pnpm added release-age exceptions. It was
replaced with 5.0.0 and all added exceptions removed; existing workspace policy
is unchanged. The first negative harness run caught Biome's migration selecting
`preset: none`; it is now explicitly `recommended`. The probe now uses isolated
files for rule-specific diagnostics and verifies a passing replacement too.
The retry-effect lint finding was resolved with a narrow rationale, not by
removing retry behavior or disabling the rule globally. Final full checks pass.
Inherited NO_COLOR/FORCE_COLOR produced harmless browser-run display warnings.

CI configuration: push/pull_request on Ubuntu and Windows; official Actions
pinned to independently checked commit SHAs (pnpm's annotated tag resolved to
its commit); Node/pnpm read from repository pins; frozen install, same local
quality/test commands, 20-minute limit and contents-read-only token. No secrets,
deployment, artifact publication, cloud provisioning or branch protection change.
Workflow review precedes this commit; actual remote execution follows push.
M00 remains pending remote CI until both exact-SHA jobs pass. External webhook
settings are not visible from the local repository; no local deployment hook exists.

See [README](../README.md#test-harness-and-ci-m00-05), the
[test strategy](../.ai/FinPath_Delivery2_v1/docs/testing/TEST-STRATEGY.md#m00-05-implemented-harness-2026-11-02)
and [workflow](../.github/workflows/ci.yml) for reproducible commands/configuration.
Browser reports/traces stay in ignored local output. This gate covers only
synthetic local auth boundaries; real provider/resource authorization, financial
algorithms and deployment remain future work. M01-01 was not executed.

### M00-05 first CI run and checkout correction

The task commit `cd1b02b1720bc3cd0d7e425e6d7f9b1d6c96cb36` was pushed to
`origin/codex/m00-05-test-harness`; local/upstream/remote SHAs matched. Its
[first CI run](https://github.com/guangtian0330/personalFinance/actions/runs/41561878016)
failed Windows Format: the fresh checkout converted all 47 checked files to
CRLF, conflicting with the existing LF formatter rule. This required failure
blocks M00 closure; no downstream skipped check is treated as passed.
Ubuntu completed every check successfully in that first run.

A narrow follow-up adds root `.gitattributes` with `text=auto eol=lf`, aligning
Git checkout with EditorConfig/Biome on both platforms. Binary files retain
automatic binary detection; no global Git setting or source behavior changes.
The already-pushed task commit is preserved; the fix uses an ordinary follow-up
commit/push, with no rewrite or force push. Recheck the corrected SHA's two CI
jobs before closure. Local `git -c core.autocrlf=true cat-file --filters` checks
all 48 tracked engineering source/config files: every checkout now uses LF and
matches the already verified working copy byte for byte. The same probe before
the fix reproduced CRLF in `apps/api/package.json`. `pnpm format:check`,
`pnpm lint` and `git diff --check` pass. No application tests need local rerun
for this attributes/docs-only correction; the corrected SHA runs both full CI jobs.

## M00-04 verification and review waiver

Authorization: after M00-04 was named as next, the user instructed
"继续执行。并且跳过人工审核的部分。" on 2026-11-01. This authorizes the current
Step and overrides its manual R checkpoint: **WAIVED_BY_USER**. No reviewer or
human approval result is fabricated. Automated safety checks, scope restrictions
and production/release gates remain. No global QA policy was weakened.

Branch: `codex/m00-04-auth-boundary`, created from `71c84d8`. The tracked tree
was clean; existing untracked source material and ZIP remain excluded. Changes
are the core auth interfaces, API configuration/provider/middleware and private
health probe, additive shared 401 error code, test command/fixtures and directly
related contract/security/startup/status docs. No dependency or lockfile changed.

The [auth contract](../.ai/FinPath_Delivery2_v1/docs/architecture/API.md#m00-04-local-authentication-boundary)
and [security boundary](../.ai/FinPath_Delivery2_v1/docs/architecture/SECURITY.md#m00-04-local-mock-boundary)
define the exact implementation. Default/disabled providers accept no credentials.
Only the trusted Node local entrypoint with APP_ENV=development, MOCK_AUTH=true,
and compatible NODE_ENV returns the fixed synthetic actor/workspace. Other
requested mock configurations fail before listening. The portable handler rejects
runtime mock bindings; a local mock instance rejects deployment auth bindings.
Origin/host/forwarding checks add protection without granting identity from headers.
The private namespace authenticates before validation and uses request-local,
immutable trusted scope. This is only partial IT-005, not real-resource isolation.

| B0 / L0-L2 verification (Windows PowerShell, Node 24.22.1, pnpm 11.25.0, TypeScript 6.0.3) | Observed result |
| --- | --- |
| `pnpm install --frozen-lockfile --offline --reporter=append-only` | Exit 0; lock SHA-256 unchanged: `303B48EABDB1EF7BC555E538BE6116EDD5DCA3D45C60E9570CF4FD7FFFC7075A`. |
| `pnpm typecheck` | Exit 0; six packages compile, core retains no framework/HTTP/Node/browser dependencies. |
| `pnpm test` (includes build) | Exit 0; 48/48 tests passed, zero failed/skipped/cancelled: all 33 previous regressions plus 15 M00-04 tests. Vite bundle built. |
| Source `src/dev.ts` and compiled `dist/dev.js` startup subprocesses | 12 cases passed: production, preview, staging, missing APP_ENV, conflicting NODE_ENV and malformed flag each exit 1 before listener-ready output. |
| Auth/schema/Web boundary | Verified default denial, fixed immutable synthetic actor, forged header/cookie/body/query rejection, missing middleware/context, concurrent actor/workspace isolation, provider-error sanitization, 401 decoding and status/code mismatch rejection. |
| Runtime boundary negatives | External/null origin, public/suffix-spoofed host, forwarding metadata, portable mock bindings, local/deployment binding mixture and caller config mutation all fail closed. |
| Process-scoped `APP_ENV=development`, `NODE_ENV=development`, `MOCK_AUTH=false`; `pnpm dev`; Node `fetch` assertions | 6/6 direct 8787 / proxied 5173 cases passed: public health 200, protected GET/POST with forged identity and query 401. |
| Same local launch with `MOCK_AUTH=true`; Node `fetch` assertions | 12/12 direct/proxied cases passed: legacy/versioned/private health 200, external Origin/forwarded Host 401, authenticated unknown query 400. |
| Ctrl+C for each owned launcher, then listener check | Ports 5173 and 8787 have no listeners. Test environment flags were process-scoped; no persistent Windows setting changed. |
| Documentation / diff audit | All 18 task-owned files, 82 local links and 12 anchors checked; no credential-pattern findings, trailing whitespace or missing links. Read-only code/security and documentation review found no remaining blocker. |

A read-only security review found no remaining implementation blocker. No test
failure was waived. Browser UI was not changed; public health, Web adapter and
actual Vite HTTP proxy regressions passed. Lint/formatter, Vitest/Playwright
harness and remote CI are NOT_APPLICABLE_YET until M00-05. The existing Node
tests and real HTTP assertions provide B0 evidence. No cloud service was used.

Git delivery target: one task commit on `origin/codex/m00-04-auth-boundary` under
standing authorization after diff/link/secret review. Its own unknown SHA is
not embedded here; report the actual push and exact-SHA CI result afterwards.
Remaining scope: real auth/session verification and resource-level authorization
belong to later approved Steps. M00-05 was not executed; no merge or deployment.

## M00-03 verification and approved contract

Authorization: the user's explicit next-task instruction on 2026-10-31 selects
M00-03 from Delivery2. Branch: `codex/m00-03-contracts`, based on the M00-02 SHA
above. There were no tracked edits on entry; unrelated untracked Delivery2
sources and the ZIP are preserved. Verification applies to the task implementation
diff against that base; the approval follow-up changes documentation only.

The approved scope is the
[M00-03 foundation contract](../.ai/FinPath_Delivery2_v1/docs/architecture/API.md#m00-03-foundation-contract):
GET `/api/v1/health`, stateless POST `/api/v1/health/check` with exactly
`{"check":"health"}`, existing GET `/health` compatibility, strict versioned
query/body validation and stable 400/404/500 errors. All success bodies remain
`{"status":"ok","service":"finpath-api"}`. Error details are empty; request
IDs are server-generated UUIDs, and no input/exception/stack is returned.

Changed surfaces: contracts schemas/types, exact Zod dependency/lock, package
type declarations, Hono error/validation boundary, Web typed adapter, Vite proxy,
root dev/test scripts, focused synthetic fixtures/tests, API documentation and
task/status/navigation records. Existing web timeout/retry UI and legacy health
behavior remain. No domain/authentication/storage/DB migration is introduced.

| B0 / L0-L2 check (Windows PowerShell; Node 24.22.1, pnpm 11.25.0, TypeScript 6.0.3) | Observed result |
| --- | --- |
| `pnpm install --reporter=append-only` | Exit 0; added only pinned Zod 4.6.7 from the npm registry. |
| `pnpm install --frozen-lockfile --offline --reporter=append-only` | Exit 0; lock SHA-256 unchanged: `303B48EABDB1EF7BC555E538BE6116EDD5DCA3D45C60E9570CF4FD7FFFC7075A`. |
| `pnpm typecheck` | Exit 0; all six composite packages compile. |
| `pnpm test` (includes `pnpm run build`) | Exit 0; 33/33 Node tests passed, zero failed/skipped/cancelled. Includes the prior 15 tests and 18 M00-03 tests. Vite production bundle built. |
| In-memory compiler probes under API and Web settings | Valid Zod-inferred request/response/error types compile; three wrong literal assignments per consumer are rejected. Core platform-isolation regressions still pass. |
| Hono/client integration and schema fixtures | Valid GET/POST, malformed/empty/wrong/unknown body input, media type, repeated/empty query names, typed 404/500, fresh request IDs, sanitized errors and cancellation during body reading passed. |
| `pnpm exec tsc --build --clean` followed by `pnpm dev` | Exit 0 for clean; root dev preflight regenerated contracts, then both loopback listeners started without other compiled packages. |
| PowerShell here-string piped to `node --input-type=module`, using real `fetch` | 14/14 assertions passed across 8787 (direct) and 5173 (Vite proxy): legacy/versioned GET, valid/invalid POST, malformed JSON, empty query name and typed 404. |
| Chrome at `http://127.0.0.1:5173/` | Displayed **服务已连接** using the new client/proxy. Local screenshot: ignored `test-results/M00-03/connected.jpg`. This automated check is not human UX signoff. |
| Ctrl+C for the owned shared launcher; `pnpm build` after the clean-output check | No listeners remain on 5173/8787; build exit 0 restored all compiler output and produced the web bundle. |
| Task diff / documentation audit | `git diff --check` passed. A PowerShell/Node audit checked all 21 task-owned files, 74 local Markdown links and five anchors, final newlines, trailing whitespace and credential patterns; no findings. New file contents and the dependency lock change were also reviewed. |

The first typecheck failed because Zod's declarations reference the standard
`URL` type. Contracts now enables DOM declarations locally; root/core ambient
types remain unchanged. Two read-only review findings were fixed before the
passing tests: router helpers dropped empty query names, and JSON decoding hid
body-read cancellation. Explicit negative tests now cover both. No failure was
waived. Lint/format, Vitest, Playwright harness and remote CI are
`NOT_APPLICABLE_YET` before their M00-05 setup; real Node/HTTP/browser checks
provide the required B0 evidence. No production or cloud environment was used.
Final documentation review clarified that version-prefix query validation runs
before route resolution. The focused API suite was rerun after adding that
boundary assertion; all seven tests passed.

Manual gate: [matrix M00-03](testing/TASK-TEST-MATRIX.md) requires **R: contract
checkpoint**, and [QA rules](testing/QA-EXECUTION-RULES.md#evidence-and-human-review)
require concrete review before Verified/delivery. Reviewer: repository user.
Date: 2026-10-31 (America/Toronto). Result: **APPROVED**. Evidence: the user replied
"评审通过 批准" after the concrete contract and verification report. This approval
covers the M00-03 routes, strict request/response validation, typed errors, empty
details, request IDs and compatibility behavior documented above. It does not
approve future business contracts or satisfy the separate M00-02 UX checklist.

Git delivery: all required local/review gates passed. The delivery target is
`origin/codex/m00-03-contracts`, one logical Step commit under standing
authorization. The API source was already present
but untracked; only this required, reviewed source is added to task ownership.
Other untracked source documents and the ZIP remain excluded. Delivery completed
as `04113e98f9b7b7ce2c573feb879f0db1372db1fe`; exact-SHA CI was not configured,
with matching local/remote branch SHA. M00-04 was not run in that Step.

## M00-02 verification and delivery evidence

The user explicitly requested the next task in the Delivery2 index, then asked
to resume it after interruption. On `codex/m00-02-web-api`, the Web and API
packages now start together with `pnpm dev` or separately for failure testing.
The API is a portable Hono Fetch handler with a loopback-only Node development
adapter. Its local liveness response is documented in the README. The page
checks the response body, bounds the request time and supports retry. This Step
introduces no domain API, authentication, migration or storage changes.

| B0 check (Windows PowerShell, Node 24.22.1, pnpm 11.25.0) | Observed result |
| --- | --- |
| `pnpm install --frozen-lockfile --offline --reporter=append-only` | Exit 0. All seven workspace projects resolved. Lockfile SHA-256 stayed `26A5108503F6AFCA190343F821E14222D9AD53008AF0B67F2CA3AA147432A7B6`. |
| `pnpm typecheck` and `pnpm test` (includes `pnpm run build`) | Passed. Six composite packages typechecked and Vite produced a web bundle. All 15 Node tests passed (7 workspace, 3 API, 5 web). Zero skipped. |
| `pnpm dev` and PowerShell `Invoke-WebRequest` to `/health` on ports 8787 and 5173 | Direct and proxied requests each returned HTTP 200 with `{"status":"ok","service":"finpath-api"}`. Both listeners used 127.0.0.1. |
| Chrome desktop and 390×844 browser viewport | The page displayed **服务已连接** at both sizes. The narrow layout fit the viewport with the retry button visible. |
| `pnpm dev:web` with API stopped, then `pnpm dev:api` and **重新检查** on the same page | Observed **暂时无法连接**, followed by **服务已连接** after retry. Automated browser evidence is reproducible with the [README smoke instructions](../README.md#run-the-local-web-app-and-api-m00-02). Local screenshots are in ignored `test-results/M00-02/`. |
| Duplicate `pnpm dev` with API port already occupied | Expected exit 1. Original API still returned the health payload and the failed launch released port 5173. Final shared start and Ctrl+C cleanup verified both ports refused connections. |

The first typecheck exposed missing Fetch declarations and a server-union type
mismatch. The first suite run then exposed a workspace compiler probe resolving
ambient types from the repo root. Fixes scoped the API types and corrected the
test harness to use its package config path. Its internal dependency checks
still require `workspace:*` and matching project references. The initial sandbox
browser request hit a socket restriction. The successful browser trace used
ordinary Windows loopback processes. There is no project lint/format command or
CI workflow at this B0 gate. No active repository delivery hook was found.

### M00-02 human UX acceptance

- Gate: `U@M00-02` — **PASS**. Reviewer: repository user. Confirmation received
  on 2026-10-31 (America/Toronto), in this conversation.
- Evidence: the user's explicit statement, "M00-02 人工 UX 验收通过".
- Accepted scope: the delivered M00-02 local dev-smoke UX described by the
  [human checklist](testing/TEST-MILESTONES.md#humanmanual-acceptance-checklists):
  launch, connection feedback, understandable outage feedback and recovery.
- Artifact reference: M00-02 implementation
  `e474cd6cb04d1e3a52ca8243b089649171512a1c`, delivered on
  `origin/codex/m00-02-web-api`. The current branch at confirmation is
  `codex/m00-03-contracts`, HEAD `04113e98f9b7b7ce2c573feb879f0db1372db1fe`,
  retaining that UX with the approved M00-03 API adapter.
- The user did not separately supply the browser, viewport, test-session revision
  or per-action trace. This is the user's acceptance of the delivered flow;
  those execution details are not inferred from the earlier automated checks.
- The pending M00-02 UX gate is cleared. Later Steps still require their own
  authorization, prerequisites and checks; production/release gates remain.
- This follow-up changes acceptance/status documentation only. Documentation
  links, state consistency and staged diffs are checked; application tests are
  not rerun because application code, contracts and dependencies are unchanged.
  Pre-existing untracked Delivery2 material remains excluded.

## QA milestone / Git policy authoring (documentation only)

- Authorization: user invoked `.ai/FinPath_QA_Milestones_Codex_Prompt.md` after
  separately delivering M00-01. This is not an M00–M09 implementation Step.
- Precondition confirmed at task start: local HEAD and `origin/codex/m00-01-workspace` both
  resolve to M00-01 commit `ea5c7c9dd0ad0a4018c1d3c6323790d383f20468`;
  no tracked/staged implementation changes remained. Existing unrelated
  untracked Delivery2 material and ZIP are preserved/accounted for.
- State: Verified locally on 2026-10-31; documentation checks and policy review
  passed. Git delivery and remote CI are reported separately after this commit.
- Outputs: root `docs/testing/TEST-MILESTONES.md`, `TASK-TEST-MATRIX.md`,
  `QA-EXECUTION-RULES.md`; minimal navigation/Git-policy reconciliation in root
  AGENTS and the existing Delivery2 addendum, strategy, roadmap and task index.
- Source review: 27 tasks M00–M04 and 26 tasks M05–M09, restricted to dependencies,
  permissible surfaces, acceptance and testing sections. Two read-only reviewers
  assisted; one integrator writes files. No application code/PRD bulk loading.
- Coverage verified: 53/53 distinct actual IDs; all 56 internal dependency edges
  match the index, manifest and Step sections and are acyclic. Bootstrap remains
  M00-01's external prerequisite despite manifest `[]`. All 111 source-document
  references exist locally. Fourteen milestone gates, eight human checklists and
  IT-001 through IT-008 are mapped without marking future work complete.
- Documentation audit: a PowerShell here-string piped to
  `node --input-type=module` checked IDs/order/columns, prerequisites, gates,
  source existence, 146 local Markdown links and two anchors, final newlines,
  trailing whitespace and sensitive-content patterns; exit 0. The only initial
  email-pattern hit was the existing GitHub SSH remote, reviewed and excluded.
- `git diff --check` passed. Read-only comparison against the supplied ZIP found
  all 52 newly versioned Step sources unchanged; M00-01 is unchanged from HEAD.
  No application code, dependency/lockfile, schema, API or financial behavior
  changed. The staged audit covers 69 documentation paths and their versioned
  link targets. Its first cached-diff check found an extra blank line at the
  matrix EOF; that formatting issue was removed before the required rerun.
- Final policy review resolved the M00-05 ordering: local checks and workflow
  review precede commit/push; exact-SHA remote CI follows push and blocks
  milestone closure / dependent Steps until successful. AGENTS/addendum, matrix,
  strategy and roadmap use this same distinction. Late-task review also made
  weight-sum, zero-versus-unknown income and staging mock rejection explicit.
- The commit includes only the nine authored policy/status documents and their
  previously untracked direct source/link targets (52 unchanged Step files,
  manifest, QA request and six architecture/algorithm/test/decision sources).
  This preserves versioned Markdown navigation without importing the whole ZIP.
  Nine indirect Step source documents remain present locally but untracked;
  they require deliberate delivery before a clean clone can execute those Steps.
  Other pre-existing untracked package material is preserved and excluded.
- No repository workflow or active Git hook is configured at this baseline;
  no known automatic deployment trigger was found. External integration/webhook
  settings are not visible in this local inspection. No human product acceptance
  is claimed by this documentation verification.
- Local tests and Git delivery are separate from human/remote-CI approval.
  Future successfully verified Steps now have standing ordinary commit/push
  authorization. No automatic next Step, force-push, merge, PR, tag, release,
  deployment or cloud resources. Scope/release/security gates remain unchanged.
- Source limitations are recorded centrally: phased IT-001, incomplete opening
  fixture/withdrawal policy, proposed product coefficients/cap/risk thresholds,
  M07 import/export timing, M08 staging availability and M09 performance limits.
  Future owners resolve them before dependent implementation; no invented values.
- No implementation Step was rerun, completed or newly marked Verified. M00-01
  remains the last verified implementation; M00-02 onward remain unexecuted.
- No application test/build/lint command is required or run for this docs-only
  assignment. Validation is document links/anchors, 53-ID coverage/dependencies,
  status/policy consistency, source preservation, diff and staged-secret review.
- Delivery target: one separate documentation commit on
  `codex/m00-01-workspace`, then ordinary push to its authorized origin branch.
  Record actual commit SHA, push and remote CI results in the post-commit report.

## M00-01 delivery and evidence

- Branch: `codex/m00-01-workspace`, created from `022cae4`. The original
  implementation verification made no commit, push, deployment or cloud-resource
  change. The separately requested Git delivery is recorded below.
- Added root package/workspace manifests, `.node-version`, `tsconfig.base.json`,
  solution references, and six private ESM package skeletons under `apps/` and
  `packages/`. Source entries export no business behavior.
- Pinned Node 24.22.1, pnpm 11.25.0 and TypeScript 6.0.3. Supported Node engine:
  `>=24.22.1 <25`; exact Node pin is in `.node-version`. TypeScript is the only
  external project dependency. Internal dependencies use `workspace:*`.
- Core has no dependencies or ambient browser/Node globals. Only web/UI configs
  enable DOM libraries. API runtime types, React, Hono, Zod, Drizzle and app
  behavior remain for their later tasks. No contracts, schema or algorithms changed.
- Added `tests/M00-01.workspace.test.mjs` using Node's built-in test runner.
  TypeScript probes compile in memory; they do not modify production files.
- Updated README setup instructions, AGENTS navigation, root task navigation and
  Delivery2's M00-01 completion markers. No bulk document import or ZIP edits.
- Necessary support surfaces beyond the Step's indicative file list:
  `.node-version` for its required Node pin, `pnpm-lock.yaml` for its explicit
  lockfile criterion, `tests/` for its required focused/negative checks, and
  navigation/status files for the user's Delivery2 routing and completion record.
- At original implementation verification, only `pnpm-lock.yaml` was staged for
  tracking. The user-provided Delivery2 directory and ZIP were already untracked
  on entry and were not bulk-staged.

Validation ran in Windows native PowerShell, with the already-installed Node
24.22.1 runtime prepended to PATH for each command. pnpm 11.25.0 was already
available. The user's default Node 20.15.0/fnm configuration was not changed;
their own terminal must select the pinned version as described in README.

| Command / check | Result |
| --- | --- |
| `pnpm install --reporter=append-only` | Passed on Windows; installed TypeScript and linked all 7 projects including root |
| `pnpm install --frozen-lockfile --offline --reporter=append-only` | Passed; SHA-256 of lockfile unchanged |
| `pnpm typecheck` | Passed; composite compiler checks all six referenced packages |
| `pnpm build` | Passed; JS, declarations and build metadata emitted only under ignored package `dist/` folders |
| `pnpm exec tsc --build --clean` then `pnpm test` | Passed from cleared compiler output; test command builds its prerequisites; 7/7 tests passed, none skipped |
| `pnpm list -r --depth 0` | Passed; 7 projects and expected local workspace links |
| `git diff --check` | Passed for tracked edits; existing system LF/CRLF advisory persists |
| `git rev-parse HEAD` / `git remote -v` | Original commit and SSH origin preserved |

Tests cover workspace dependency resolution with matching project references,
valid platform-neutral code, strict null/implicit-any/unchecked-index rejection,
exact optional property rejection, core browser/Node global rejection, web DOM
availability, and an unresolved package import. `typecheck` and `build` both use
`tsc --build` and intentionally emit ignored artifacts needed by project references.

Initial registry access failed inside the sandbox with a DNS error; approved
network access succeeded. `pnpm list` initially could not open pnpm's external
store index under the sandbox; the approved retry passed. The first install
reported an obsolete `packageManagerStrictVersion` option; it was removed and
the frozen install completed without that warning. No failed checks were hidden.

Lint/format tooling, Vitest, integration/E2E and CI were NOT RUN because they are
not configured until M00-05 (and no application flow exists in this Step).
There are no remaining M00-01 blockers. M00-02 and QA-policy authoring are not
part of the separately requested Git delivery.

## M00-01 Git delivery verification (2026-10-30)

- User explicitly requested Git delivery only: verify existing M00-01 work,
  commit its related files and push the current branch. No implementation redo,
  M00-02 work or QA-policy authoring was performed.
- Local state: Verified. Branch and authorized push target:
  `codex/m00-01-workspace` -> `origin/codex/m00-01-workspace`.
- Current Windows environment: Node 24.22.1, npm 11.19.1, pnpm 11.25.0. These
  versions now resolve without per-command PATH changes after the separate
  environment task. Corrected README's fnm shell argument to `power-shell`.
- Re-ran `pnpm install --frozen-lockfile --offline --reporter=append-only`,
  `pnpm typecheck`, `pnpm build` and `pnpm test`: all passed; 7/7 tests passed,
  none skipped; lockfile SHA-256 unchanged.
- Commit scope: M00-01 configuration, six package skeletons, focused tests,
  associated navigation/status updates, its delivery task/index, addendum,
  START-HERE and the two referenced architecture documents. Remaining Delivery2
  specifications, the original ZIP and the QA prompt are separate local material
  and are not included in this task commit.
- Lint and integration/E2E checks remain unavailable until later tasks; no
  `.github/workflows` or other tracked auto-deployment pipeline was found.
  Local verification does not assert remote CI success or human UX acceptance.
- The same task commit carries this evidence. Its resulting SHA and actual push
  result are reported after committing; no self-referential commit SHA or
  unverified push success is recorded here. No merge, PR, tag or deployment.

## Repository baseline at bootstrap completion

- Actual path: `D:\myWORK\project\finpath` (Windows-backed; not relocated).
- Reused the existing repository; no clone or Git initialization was performed.
- Branch: `main`; upstream: `origin/main`.
- Origin fetch/push: `git@github.com:guangtian0330/personalFinance.git`.
- Existing HEAD: `4c385ace4677c320d0705e67603e61c5bf6df197` (`Initial commit`).
- Local `origin/HEAD` points to `origin/main`. This is the existing local remote
  reference, not a fresh network verification of GitHub's default branch.
- Before bootstrap: tracked `README.md` contained `# personalFinance`; the
  untracked `.ai/` directory held the master prompt and planning-review draft.
- Existing README heading preserved; `.ai/` files were outside bootstrap edits
  and were not staged during bootstrap.
- No new commit: the repository already has history, so the new-repository
  initial-commit condition does not apply. Further commits require authorization.
- Push: NO. No PR, deployment or remote mutation.

Subsequent user authorization: stage and commit all repository changes,
including the two `.ai/` planning documents, and push `main` to `origin`.
The baseline and verification results in this document describe the completed
bootstrap before that Git operation. Git history and remote refs record the
resulting commit and synchronization state.

## Bootstrap environment inspected (2026-10-27)

| Check | Observed result |
| --- | --- |
| Shell / path | PowerShell, `D:\myWORK\project\finpath` |
| `git --version` | `2.47.1.windows.2` |
| `node --version` | `v20.15.0` |
| `npm --version` | `10.7.0` |
| `codex --version` | `codex-cli 0.164.0-alpha.11.1` |
| Git identity | `user.name` and `user.email` are configured; no changes made |

Codex CLI returned its version but warned that stale temporary directories could
not be cleaned and PATH aliases could not be created because access was denied
under its user-profile temporary directory. This did not prevent document work.
No tools, packages, databases or global utilities were installed. The shell is
PowerShell rather than WSL; future dependency compatibility has not been tested.

System Git has `core.autocrlf=true`. Git emitted a warning that LF in README may
be replaced with CRLF on a future checkout. Current bootstrap text files were
verified to use UTF-8/LF and `.editorconfig` requests LF; no Git configuration was
changed. The warning did not cause `git diff --check` to fail.

## Bootstrap artifacts

- Extended `README.md`; added `AGENTS.md`, `.gitignore`, `.editorconfig`, this
  status file and `tasks/README.md`.
- Added empty `apps/web/`, `apps/api/`, `packages/core/`, `packages/contracts/`,
  `packages/persistence/`, `packages/ui/`, `docs/requirements/`,
  `docs/architecture/`, `docs/algorithms/`, `docs/decisions/` and `tests/`, each
  retained with `.gitkeep`.
- `tasks/` holds its index; `docs/` holds this status file. No approved product,
  architecture, algorithm or executable Step specification was created.

## Bootstrap verification (2026-10-27)

| Command / check | Verified result |
| --- | --- |
| `git rev-parse --show-toplevel` | Expected Windows-backed project root |
| `git remote -v` | Expected SSH origin for fetch and push |
| `git status --short --branch --untracked-files=all` | On `main`; README modified; only bootstrap additions and the two pre-existing `.ai/` files untracked |
| `git branch -avv` and `git symbolic-ref --short refs/remotes/origin/HEAD` | `main` tracks `origin/main`; cached remote HEAD is `origin/main` |
| `git log -5 --format=oneline` | Existing initial commit only |
| `git diff --check` | Passed, exit 0; LF/CRLF advisory described above |
| `git diff -- README.md` and new-file content inspection | Original heading retained; documentation/configuration only; no real financial data or credentials in bootstrap changes |
| `git diff --cached --name-only` | Empty; nothing staged |
| `Get-ChildItem -Path apps,packages,docs,tasks,tests -File -Recurse -Force` | Expected skeleton: 11 `.gitkeep` files plus project status and task index |
| PowerShell strict UTF-8/whitespace checks | All 6 document/config files use UTF-8, LF, final newline and no trailing whitespace |
| PowerShell placeholder/link/count checks | All 11 placeholders empty; local Markdown links resolve; candidate Step counts total 53 |
| `git check-ignore --quiet --no-index -- <path>` with individual path arguments | 18 sensitive/generated path cases ignored; 7 example/source/lock/prompt cases remain visible |

Ignore checks included nested environment files and the exact `.env.example`
exception, local D1/SQLite data, user imports/exports/backups, credentials, keys,
dependency/test output, SQL migration source, synthetic CSV fixtures and package
manifests/locks. No probe files were written. File names and contents were
reviewed; the pre-existing `.ai/` documents were neither edited nor staged.

No application tests, lint, type checks or builds were run: bootstrap
intentionally creates no package manifest, source code or CI files. No runtime
behavior, API contracts, database migrations or financial algorithms changed.

## Bootstrap follow-up (historical)

Bootstrap originally stopped pending formal documents and M00-01 authorization.
The user supplied Delivery2 and explicitly requested M00-01 on 2026-10-30; its
outcome and the next authorization gate are recorded at the top of this file.
