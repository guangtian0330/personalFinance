# FinPath QA execution and Git delivery rules

Effective: 2026-10-30. Scope: one explicitly authorized implementation Step,
plus the current documentation-only QA-policy assignment. This policy specifies
required evidence; it does not claim future tests, scripts or features exist.

## Authority and navigation

The user explicitly invoked the [QA policy authoring prompt](../../.ai/FinPath_QA_Milestones_Codex_Prompt.md).
Its standing authorization requires one logical commit and one ordinary push
after every successfully verified Step, to the current authorized remote branch.
This replaces generic no-automatic-push / fresh-permission-per-push wording in
the existing Delivery2 Step templates, addendum, START-HERE and older bootstrap
instructions. Their other scope, prerequisite, architecture and security gates
remain binding. Later direct user instructions may narrow or revoke this grant.
Do not rewrite all 53 Step files to repeat this policy.

An approved PRD, architecture/ADRs and contracts still govern behavior. A QA
requirement does not approve a proposed product decision or widen implementation
scope. Read [AGENTS.md](../../AGENTS.md), the requested Step, its source docs, its
own [matrix row](TASK-TEST-MATRIX.md), and the applicable
[milestone gate](TEST-MILESTONES.md), then only relevant code/tests. Ordinary
Step sessions must not preload all 53 tasks or the full PRD.

Specification paths such as `tasks/INDEX.md` and `docs/architecture/DOMAIN.md`
resolve under `.ai/FinPath_Delivery2_v1/`; this QA policy lives in root
`docs/testing/`. Root [project status](../PROJECT-STATUS.md) records evidence.
The [delivery index](../../.ai/FinPath_Delivery2_v1/tasks/INDEX.md) and
[manifest](../../.ai/FinPath_Delivery2_v1/tasks/MANIFEST.json) define the 53 IDs and
dependencies. Index display order does not create extra dependency edges.

## Required local workflow

1. Identify the single requested ID and approval. A bare "continue" after a
   completed Step does not authorize another Step. Confirm declared prerequisites
   are locally Verified, their required delivery/CI gates are satisfied, and any
   applicable human gate is resolved. If a material design choice is missing,
   record `BLOCKED_SPEC` with a concrete review proposal; do not invent a rule.
2. Inspect `git status --short --branch`, `git remote -v`, current branch/upstream,
   recent commits and task-owned paths. Account for existing dirty/untracked work
   without discarding or including it. Confirm the authorized push destination.
   No clone/init, silent remote change or relocation. Inspect workflows/hooks
   available in the repository for automatic deployment before pushing.
3. Present the smallest file/interface/invariant/test plan. Keep contract/schema
   changes at their explicit review checkpoint. Previously recorded approval of
   the same concrete design satisfies that checkpoint; do not request it again.
4. Implement only the Step. Add or update focused deterministic synthetic tests,
   including a negative/boundary case when behavior warrants it. Preserve old
   regression tests; do not change expected results merely to conceal a defect.
5. Run the common checks below and the matrix's focused/regression checks. Use
   real script names discovered in manifests; record exact commands, working
   directory, tool versions, exit codes and relevant output. For dev servers,
   record start command, URL/port, health and web-to-API assertion, and stop only
   processes started for this check. Never leave uncontrolled test services.
6. Inspect the full task diff and staged/untracked filenames for unrelated edits,
   credentials, financial/identity data, `.env`, exports, local DBs and generated
   output. Inspect content, not filenames alone. All fixtures/screenshots/logs
   must be synthetic and redacted. No unsafe migration or authorization shortcut.
7. Record local outcome, branch, commands/results, applicable gate IDs, human
   status and limitations in project status; update the existing task marker
   only after actual verification. These updates belong in the same task commit.
8. If every required local/design gate passes, perform the delivery protocol
   below. Report its observed result and STOP. No next Step, automatic merge, PR,
   tag, release, deployment or cloud-resource provisioning.

Remote CI is a **post-push** gate, including the first M00-05 workflow run.
Validate workflow configuration and run its available checks locally before
local Verified/commit/push. Then require successful checks for the exact pushed
SHA before closing the milestone or admitting a dependent Step. Do not wait for
an uncreated commit's CI before creating that commit; do not treat local Verified
as proof that remote CI passed.

## Test levels, common checks and severity

| Level | Evidence required when the matrix assigns it |
|---|---|
| L0 | Dependency/configuration consistency, actual lint/typecheck/build commands, diff/secret review and reproducible install where dependencies change |
| L1 | Focused unit/property tests with explicit units, fixed clock/seed, normal and negative/boundary cases |
| L2 | Repository transactions or HTTP contracts: real test persistence, authorization context, rollback/idempotency and competing writes where relevant |
| L3 | Browser/UI and end-to-end assertions across real module boundaries, plus separately recorded human UX checks at U gates |
| L4 | Assigned security, performance, migration/recovery or release checks; L4 is not a substitute for lower-layer correctness |

`B` in the matrix means common checks plus all assigned levels. Once established
by M00-05, run `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build`, relevant
format checks, and the affected integration/E2E suites. If package filtering is
used, document the dependency/regression radius and why no impacted consumer is
omitted; at milestone integration gates run the full affected cross-module suite.
Required local failures at **every severity** prohibit commit/push.

`B0` applies to M00-01 through M00-04: run actually available install/typecheck/
test/build commands and focused observable assertions. At this policy's baseline,
root scripts are only `typecheck`, `build` and `test`; both compiler scripts use
`tsc --build`, and `test` builds then runs the seven M00-01 Node tests. No `lint`,
Vitest, `test:integration`, `test:e2e`, CI or application server exists yet.
Unavailable future tooling is `NOT_APPLICABLE_YET` with a reason, never PASS.
An equivalent direct assertion may satisfy a pre-harness requirement if recorded.
A required behavior/environment that cannot be checked is BLOCKED, even in M00.
After its owning setup Step, a missing required command is a blocker, not an
automatic exemption. This QA-document task runs document validations only.

| Severity | Meaning |
|---|---|
| S | Standard configuration/UX correctness; failed required checks still block delivery |
| H | Contract, persistence or cross-module regression risk; targeted integration proof is mandatory |
| C | Accounting, authorization, concurrency, destructive-data or release safety; no waiver may bypass the invariant/security failure |

Fixture requirements derive from [DOMAIN](../../.ai/FinPath_Delivery2_v1/docs/architecture/DOMAIN.md),
[SECURITY](../../.ai/FinPath_Delivery2_v1/docs/architecture/SECURITY.md),
[REPORTS](../../.ai/FinPath_Delivery2_v1/docs/algorithms/REPORTS.md),
[REGISTRY](../../.ai/FinPath_Delivery2_v1/docs/algorithms/REGISTRY.md), and the
[integration contracts](../../.ai/FinPath_Delivery2_v1/docs/testing/INTEGRATION-ACCEPTANCE.md).
Preserve per-currency debit=credit, expense-once accounting, transfer-neutral net
worth, checked minor units and rounding, source-level reservation limits, atomic
top-level active cap, immutable/audited history, idempotency, tenant isolation,
deterministic versioned algorithms and side-effect-free previews. A green unit
suite cannot substitute for their cross-module proof.

## Evidence and human review

Each proof record includes Step and scope, tested Git revision/diff, environment,
command, exit code, case names/counts, synthetic fixture identity, fixed clock/
timezone/seed where relevant, expected versus actual invariant/result, and a
reproducible artifact/log reference. Do not store real exports, credentials or
raw personal records as proof. Record unrun checks and their reasons explicitly.

Manual column codes in the matrix:

- **N**: no additional human gate prescribed here; the Step itself must still be
  explicitly authorized and higher-level review requirements still apply.
- **R**: concrete contract/migration/design/provider/performance or release
  review required by the sources or this policy before local Verified/delivery.
  Record reviewer, approved scope and evidence; existing explicit approval can
  satisfy it. A missing material decision blocks the owning Step, not this plan.
- **U@ID**: the reproducible human UX checklist at that milestone. Until a human
  records reviewer/date/revision/result, use `PENDING`, never inferred acceptance.
  Where the task does not itself require human approval, code may be locally
  Verified and delivered with U=PENDING. This blocks release and subsequent UX
  work consuming that unaccepted flow, as mapped in the milestone document.
  Non-UX work still requires its own user instruction and verified dependencies.
- **R+U**: both rules apply. If the Step's acceptance explicitly requires human
  approval (notably M09-05), a pending approval prevents Verified/commit/push.

An automated click on an application's Confirm button tests product behavior;
it is not human QA signoff. No assistant may fabricate a reviewer, approval time
or acceptance. When asking for missing approval, first prepare the concrete,
reviewable result within the authorized scope and identify the exact pending gate.

## States and failures

Keep local implementation, Git delivery, CI and manual acceptance as separate
fields. `Verified` means all currently required local/Step review gates passed;
it does not mean remote CI passed, UX was accepted or release was approved.

| State | Required action / transition |
|---|---|
| Proposed / Approved / In Progress | Preserve the difference between planned, explicitly authorized and running work |
| Completed | Artifacts exist but required verification remains; no delivery yet |
| Verified | Required checks/reviews passed with evidence; proceed to authorized task commit/push |
| BLOCKED_SPEC / BLOCKED_ENV | Missing specification/approval or required environment; report exact gap, no verified commit/push |
| BLOCKED_TEST | Required test failed, skipped, flaky, or unavailable without an equivalent permitted proof; fix only current scope, rerun impacted checks, otherwise stop |
| BLOCKED_COMMIT | Commit failed; retain files/index, report error, do not push |
| NO_CHANGES | No task diff; report needs review; never create an empty commit |
| PUSH_PENDING | Local commit exists but transport/auth/non-fast-forward failed; keep its SHA, resolve safely and retry that same push without duplicate implementation/commits |
| PUSH_BLOCKED | Branch protection or policy denies push; report the intended PR workflow and stop; do not bypass protection or create/merge a PR without authorization |
| PUSHED_CI_PENDING | Push succeeded and remote checks are running; read their status for the exact SHA; next Step blocked until required checks pass |
| PUSHED_CI_FAILED | Remote check failed; block next Step, inspect diagnostics, repair the same Step within authorized scope, make a focused corrective commit if needed; no history rewrite |
| PUSHED_CI_UNKNOWN | Push succeeded but required CI is inaccessible/indeterminate; report access limit and block next Step until verified |
| PUSHED_CI_PASSED | All required checks for the pushed SHA passed; next Step still needs explicit user authorization |
| PUSHED_CI_NOT_CONFIGURED | No CI configured yet, as expected before M00-05; state this rather than claiming green CI |

Do not repeatedly rerun flaky tests until a lucky pass conceals the defect.
Record the first failure and any retry reason; a reproducible repair and passing
affected checks are needed. Non-applicable future checks are not failed/skipped
required checks. Once CI is required at M00-05, missing/non-triggered expected
checks are `PUSHED_CI_UNKNOWN` or a configuration failure, not NOT_CONFIGURED.

## Commit, push and post-push CI

The standing request covers ordinary successful Step commits/pushes, including
this documentation assignment. Do not ask again merely because an older template
says no automatic push. Tool sandbox/network approval may still be required;
it does not grant force-push, production execution or a different destination.

1. Confirm exact current branch, authorized `origin`, clean/accounted-for state
   and the staged task-owned file list. Use explicit paths, never blind
   `git add .` / `git add --all` in a dirty workspace. Inspect `git diff --cached`
   and `git diff --cached --check`; preserve unrelated staged work and stop if it
   cannot be safely separated without changing user intent.
2. Include implementation, tests, related docs and status evidence in one logical
   Step commit. Suggested title: `<type>(<module>): <summary> [Mxx-yy]`.
   For this non-Step assignment use a documentation title, not an invented Mxx ID.
   Put the actual commit SHA in the post-commit report, not in its own commit.
3. Run `git commit`, then `git push origin HEAD` (or the verified upstream
   equivalent; `git push -u origin HEAD` may establish the authorized branch).
   On an authorized, unprotected main-only flow this may be main; on a task branch
   push that branch only. No automatic merge or PR. Do not reset/rebase away user
   work, amend a published commit, force push, or bypass server checks. If the
   remote advanced, report divergence and prepare a safe resolution for review.
4. Verify local HEAD matches the pushed remote branch and inspect remaining
   working-tree changes. Do not claim a completely clean tree if unrelated user
   files remain. A push failure is not grounds to redo the Step or duplicate its
   commit. A source repair after CI failure may add a corrective commit to the
   same logical Step; preserve the audit history.
5. Query both commit status contexts and check/workflow runs for the exact pushed
   SHA when available. A tool limited to PR-triggered runs cannot establish that
   push-triggered CI is absent. Check required conclusions, not only transport
   success. Record missing access and status; do not label an empty list green.
   If checks run asynchronously, make bounded status checks or leave an explicit
   pending state; do not start another Step while required CI is unresolved.
6. A repository push is never deployment permission. Inspect known workflow and
   connected deployment behavior. If it would trigger unapproved production
   deployment, STOP before pushing and report `PUSH_BLOCKED`; seek authorization
   or a reviewed isolated delivery route. Do not silently disable protection or
   deploy hooks. Report unavailable visibility into external deployment settings.

## Source discrepancies and bounded resolutions

| Evidence / discrepancy | Resolution and owning checkpoint |
|---|---|
| Prompt uses root `docs/` and `tasks/` logical paths; actual delivered sources live under `.ai/FinPath_Delivery2_v1/` | Keep existing sources in place; only the three new QA documents live in root `docs/testing/`; link them from canonical entrypoints. No duplicate specification copies. |
| M00-01 manifest `dependsOn=[]`; index/Step require bootstrap | Treat bootstrap as an external prerequisite, supported by manifest's bootstrap field and verified history; do not drop it or renumber tasks. Validator explicitly checks this one exception. |
| All 53 test sections refer to generic/future M00-05 scripts | Apply B0 versus B. Owning Steps supply executable suite names and fixtures; this matrix is required coverage, not a claim of existing tests. |
| IT-001 includes ledger, budget and reports, plus a card payment without complete opening liabilities | M01-06 proves ledger subset; M02-05 adds budget; M07-05 completes reporting; M09-02 reruns the whole flow. Approve complete synthetic opening accounts/liabilities before exact net-worth assertions. |
| DOMAIN reserves cross-currency journal execution for P1 | M01/M07 verify native units, rejection of naive cross-currency operations and dated valuation; do not introduce an FX bridge ledger in this QA task. |
| Cap=3, scoring weights, urgency/risk thresholds and reserve assumptions remain proposed | Preserve labeled baseline vectors; obtain the relevant decision approval before the owning Step. See [open decisions](../../.ai/FinPath_Delivery2_v1/docs/decisions/OPEN-DECISIONS.md). Authoring QA is not product approval. |
| M04-06 requires no overfund after withdrawal but does not define shortage handling | Before that behavior is implemented, approve block/release/reallocation policy. Test atomic invariant preservation without silently choosing the product action. |
| M07-03 mentions formula safety on later export | Prove safe import handling and record the outstanding exporter contract in M07-03; prove exported cell behavior in M07-04 and close at M07-05. No early full IT-006 claim. |
| M08-02 requires controlled staging before M09-01 | Use an existing separately authorized environment; otherwise `BLOCKED_ENV`. No implicit infrastructure provisioning or public mock identity. |
| M09-03 has no numeric workload/thresholds; deployment quotas are dated | Before measuring acceptance, approve workload, dataset, concurrency, timing budget and current primary-source limits. Record measurement environment/date; no invented percent/latency/free-capacity guarantee. Optimization outside permitted surfaces needs a separate authorized change. |
| Roadmap mentions possible parallel work; index/manifest mark all 53 nonparallel | Keep declared prerequisites and serial execution. This plan does not authorize parallel implementation or overlapping file ownership. |
| Old generic templates forbid automatic push | The standing authorization above overrides only ordinary verified task delivery. Auth, migration, release, cloud and production approval gates remain. |

These resolutions unblock authoring this plan. Unresolved product/environment/
performance decisions block their owning future Steps when needed, not earlier
unrelated work. Record actual decisions in the approved source/ADR before using
them as assertions; never modify expectations simply to match implementation.

## Completion report template

```text
Task ID/name | local state | branch | commit SHA
Remote branch / push result | CI state and exact-SHA evidence
Changed files and behavior | contract/migration changes or none
Commands actually executed + exit/results | tests passed/failed/skipped/unavailable
Verified invariants and regression radius | proof/artifact references
Human gate: reviewer/date/result or PENDING / NOT_APPLICABLE
Risks, source conflicts and blockers | remaining unrelated working-tree files
Next suggested Step (NOT EXECUTED) | STOP
```
