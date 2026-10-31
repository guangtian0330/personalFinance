# FinPath — QA Milestone & Git Delivery Policy Authoring Task

You are the tech lead and QA architect for **FinPath**. This is a **documentation/policy-only task**. Do not execute `M00-01` or implement any application feature.

## Environment and authority

- OS: Windows Native; shell: PowerShell.
- Repo root: `D:\myWORK\project\finpath`.
- Git repository: `guangtian0330/personalFinance`.
- `M00-BOOTSTRAP-000` is complete. The user reports `M00-01` is locally **Verified** (7/7 tests, install/typecheck/build successful), but changes on branch `codex/m00-01-workspace` are **not yet committed or pushed**. Treat this as user-reported state: inspect Git and task evidence rather than assuming it has been delivered. Do not mark `M00-02` or later as complete.
- The user explicitly authorizes, **for each future completed and verified Step**, an automatic Git commit and push to its current authorized remote branch **after** all required local quality gates pass. This replaces older instructions that required fresh permission for every ordinary Step push. It does **not** authorize force-push, merge, production deployment, cloud resource provisioning, tag/release creation, or using live financial data.
- Keep the rule: **exactly one explicitly authorized implementation Step per session; stop after that Step**. A bare "continue" when the previous Step is finished does not authorize the next Step.

## Objective

Create an executable, evidence-driven QA and release-control plan for all existing **53 tasks M00-01 through M09-05**. Tie testing requirements to the *actual* task index, task files, architectural invariants and existing test specifications. Provide a task-relative milestone timeline, a per-Step test matrix, human/manual acceptance checkpoints, and an unambiguous commit/push protocol. Modify the minimum necessary policy documents so Codex can enforce the rules consistently in later sessions.

## Source inspection: minimal but complete

1. Inspect `git status --short --branch`, `git remote -v`, repository state, existing `AGENTS.md`, and `docs/PROJECT-STATUS.md`. Respect all uncommitted user changes. **If M00-01 remains uncommitted, STOP with `PRECONDITION_UNCOMMITTED_M00_01` and ask the user to run the separate M00-01 delivery command before this policy-authoring task. Do not mingle M00-01 implementation changes and QA-policy changes in one commit.**
2. Read: `tasks/INDEX.md`, `tasks/MANIFEST.json`, `docs/roadmap/ROADMAP.md`, `docs/testing/TEST-STRATEGY.md`, `docs/testing/INTEGRATION-ACCEPTANCE.md`, `AGENTS.ADDENDUM.md` if present.
3. Inspect **only the testing / acceptance / dependencies / permissible-change sections** of all 53 Step files, in bounded batches as needed. Do not load all source code or the entire PRD.
4. Read the specific financial/security/algorithm architectural sections necessary for test policy. Do not invent implemented scripts, APIs or tests.
5. If any source is missing or inconsistent, record the discrepancy and propose a safe resolution. Do not invent task IDs or silently mark them complete.

## Files to deliver

Create/update, without overwriting unrelated content:

- `docs/testing/TEST-MILESTONES.md`: chronological *Step-ID-based* QA milestone timeline; gate types and exit criteria; what requires human verification; deploy eligibility. Optional rough time estimates must be identified as estimates, not commitments.
- `docs/testing/TASK-TEST-MATRIX.md`: **all 53 actual IDs, one row each**: task, primary changed layer, minimal required checks, negative/boundary cases, regression radius, required proof, gate severity, and whether manual approval is required. Map to existing IT-001..IT-008 acceptance scenarios where applicable.
- `docs/testing/QA-EXECUTION-RULES.md`: mandatory Step workflow, tests-before-push, safe Git practices, statuses, failure/retry, post-push CI checks, and report template.
- Update existing `docs/testing/TEST-STRATEGY.md`, `docs/roadmap/ROADMAP.md`, and root `AGENTS.md` only where necessary to reference these new documents and unify Git rules. Preserve stronger existing architecture and security requirements. If `AGENTS.ADDENDUM.md` still says no automatic push, explicitly resolve the conflict in the canonical policy rather than leaving contradictory instructions. Avoid editing all 53 task files simply to repeat one policy; link the central matrix from the canonical instruction entrypoint.
- Update `docs/PROJECT-STATUS.md` with a record of this policy-authoring task; do **not** mark any implementation Step complete. Do not renumber M00..M09 tasks.

## Milestone timeline to reconcile against actual tasks

Use these **proposed** gates and refine from source evidence:

| Endpoint | Required validation depth |
|---|---|
| `M00-02` | Web + API dev smoke: launch processes, health routes, basic integration; not a release gate |
| `M00-05` | Infrastructure gate: reproducible install, typecheck, lint, unit harness, build, CI workflow, mock auth cannot run in production |
| `M01-06` | Ledger accounting gate: debit=credit per currency; transfer/net worth; payment/refund/reversal; precision, FX boundary, idempotency; IT-001 |
| `M02-05` | Budget/ledger reconciliation: actual from journal, no transfers counted as expenses, versioned periods, month boundaries; IT-001 |
| `M03-05` | Onboarding/feature UX: skip/restart, disable/enable, privacy, keyboard navigation, core Playwright E2E, accessibility checks |
| `M04-06` | Goals/funding invariant gate: reservations don't create assets, no over-earmarking, concurrency, atomic top-level active goal cap=3; IT-002/IT-003 |
| `M05-06` | Allocation algorithm gate: deterministic outputs, constraint satisfiability, trace/version, no silent fund movement, financial shock proposal, user confirmation; IT-004 |
| `M06-05` | Forecast/scenario gate: what-if must not mutate committed books/plan; life event / retirement preview; IT-004/IT-007 |
| `M07-05` | Reporting, FX and data portability gate: dated FX, incomplete FX disclosure, CSV duplicate/malformed detection, export/import round trip and restore safety; IT-006/IT-008 |
| `M08-05` | Security/production-auth gate: no mock auth in production, two-tenant isolation, session, permissions, sensitive logging, OWASP-oriented negative cases; IT-005 |
| `M09-02` | Full accounting-to-goals E2E across modules |
| `M09-03` | Performance/load quotas, concurrency/stress, documented thresholds/limits |
| `M09-04` | Backup restore drill + recovery runbook |
| `M09-05` | Final user-reviewed release checklist; only propose tag/deployment; do not actually release without separate explicit authorization |

Distinguish *developer-run tests* from *manual product UX acceptance*. Require a short, reproducible manual verification checklist at user-visible milestones (at minimum M00-02, M02-05, M03-05, M04-06, M05-06, M07-05, M08-05, M09-05). Tests must use synthetic data only. Human UX review may block release or subsequent UX work, but do not fabricate human acceptance.

## Test levels and per-Step rules

Define standardized levels (e.g. L0 static/config; L1 focused unit with negative/boundary; L2 repository/API integration; L3 E2E/manual acceptance; L4 security/performance/backup/release). Assign levels by risk, not by arbitrary percentages. For **every implementation Step** require:

1. Read `AGENTS.md`, the one requested Step, its `Source docs`, and its *own row* in `TASK-TEST-MATRIX.md` / milestone policy; never preload all 53 tasks.
2. Check dependencies and clean or correctly accounted-for working tree; plan the smallest diff.
3. Add or update relevant tests, including at least one negative/boundary test when behavior warrants it. Reuse deterministic synthetic test fixtures.
4. Run actually available focused tests and project scripts; once installed, at minimum relevant lint, typecheck, unit tests and build, with integration/E2E/security/load/restore tests at mapped gates. M00's pre-script tasks must be validated by appropriate existing commands and never pretend future scripts exist.
5. No regressions of previously accepted invariants; preserve journal balance, virtual reservation limits, atomic active-goal cap, side-effect-free preview, monetary currency units/rounding, user isolation, idempotency, and audited history.
6. No changing test expectations merely to make a failing implementation green. Failed, skipped, flaky, unavailable, or environment-blocked checks must be reported honestly with evidence.
7. Validate no unrelated files, real financial data, private keys, tokens, `.env`, output exports, or generated caches are in the staged diff.

## Commit + push policy — explicit standing user authorization

- **Every successfully verified implementation Step must end with one logical task commit and one push to the authorized current remote branch.** Include the Step implementation, tests, associated documentation and status evidence in that commit. Do not commit/push failed or unverified steps and do not mark them verified.
- Before modifying: inspect branch, remotes, working tree, recent commits and whether the intended branch is user-authorized. Do not touch unrelated uncommitted work. Stage only task-owned paths (plus necessary status/doc updates), never blindly `git add .` on a dirty working tree.
- After tests and diff/secret review, update `docs/PROJECT-STATUS.md` **in the same commit** with Step ID, status, test evidence and branch; include the commit SHA in the *post-commit report* rather than pretending to embed the same commit SHA in its own commit.
- Suggested commit title: `<type>(<module>): <concise summary> [Mxx-yy]`. Do not fabricate a commit when no files changed; report `NO_CHANGES / needs review` rather than making empty commits.
- `git commit`, then `git push origin HEAD` (or safely configured upstream equivalent). NEVER force push, rewrite or reset history. For main-only solo flow, push main if authorized and unprotected; if on task branch, push that branch and **do not automatically merge**. If branch protection blocks push, report `PUSH_BLOCKED` and the intended PR workflow; do not bypass policy.
- If local tests fail, stop `BLOCKED_TEST`, no commit/push. If commit fails, stop `BLOCKED_COMMIT`, no push. If push fails, report `PUSH_PENDING` with local commit SHA and exact error; do not reimplement or duplicate commits on retry. Only retry the *same* push after resolving credentials/network/remote conflicts safely. If remote CI runs after push, report `PUSHED_CI_PENDING` and check its result if accessible; failure blocks the next Step until repaired.
- A commit/push is **not** permission for deployment. The repository must never automatically deploy to production from ordinary development pushes unless separately authorized and explicitly reviewed. Flag any existing auto-deploy pipeline in the report.
- Report: Task ID | state | branch | commit SHA | remote branch/push result | commands actually executed | test failures/skips | CI state | manual acceptance pending | next suggested Step **not executed**.
- This is a **standing explicit user request** for ordinary successful task pushes; reconcile older `no automatic push` language accordingly. Preserve all other safety restrictions.

## Preconditions from current user state

Because M00-01 is already locally Verified but not committed/pushed, the user must first complete its **Git delivery only**, separately from this documentation task. The first action of THIS task is to inspect the working tree; if the M00-01 changes remain uncommitted, do not modify any file and report the specific blocking prerequisite. Once those changes are committed and pushed, continue this documentation-authoring task in a new Codex turn. This is not authorization to redo M00-01.

## Execution boundary for THIS request

Your present job is to **write the QA plan and instructions**, not to implement financial software or run any Mxx-yy Step. Validate Markdown links, 53 task IDs, existing prerequisites, consistency of status rules, and `git diff --check`. For this documentation-only assignment, after reviewing the diff for secrets and unrelated changes, create a single documentation commit and push under the same safe rules above if credentials/branch allow it. If blocked, report why and stop. Do not start `M00-01`, future tasks, deployment, release or tag creation automatically.

Respond with the written file paths, a concise milestone summary, coverage count (must be 53/53), validation run, commit SHA, push/CI status and any unresolved conflicts. Stop.
