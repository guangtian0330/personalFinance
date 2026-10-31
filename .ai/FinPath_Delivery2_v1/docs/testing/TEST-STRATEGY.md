# FinPath test and verification strategy

## Enforced QA policy (2026-10-30)

Use root [QA-EXECUTION-RULES](../../../../docs/testing/QA-EXECUTION-RULES.md), the
requested Step's [TASK-TEST-MATRIX row](../../../../docs/testing/TASK-TEST-MATRIX.md)
and [TEST-MILESTONES gate](../../../../docs/testing/TEST-MILESTONES.md). These
define B0/B, risk levels L0–L4, evidence, phased IT completion, manual acceptance,
failure states and the user's standing verified-Step commit/push authorization.
The matrix adds required QA cases; it does not declare future tests implemented
or proposed financial/product policies approved. Existing invariants below remain.

## Test pyramid

1. Pure domain unit tests (Vitest): Money, postings, goal statuses, allocation, rounding, timeline boundaries.
2. Repository/transaction tests: Drizzle+D1-compatible SQL, tenant scope, atomic updates, migration reruns, overfund conflicts.
3. HTTP contract tests: Hono validation, typed errors, auth and authorization, idempotent request replay.
4. UI component tests: onboarding skip, feature hiding, keyboard, budget table, confirmation flows.
5. Playwright E2E: successful finances, retries, wrong tenant, export/import, rejected 4th goal, plan confirmation.
6. Release tests: backup restore, quota/load, error redaction and auth hardening.

## Mandatory mathematical properties

- For every posted journal and currency, total debit equals total credit.
- Transfers never change aggregated net worth of owned accounts by themselves.
- Expense counted once regardless of payment method and settlement.
- `totalReserved(account,currency) <= eligibleAvailable(account,currency)` after concurrent attempts.
- `activeTopLevelGoalCount(workspace) <= 3` after concurrent activation.
- Goal preview and scenario are side effect free.
- All calculations deterministic for same inputs and algorithm/version.
- Money and FX preserve units, no naive addition of currencies, boundaries not rounded incorrectly.
- Multi-tenant: no B information readable or mutable by A.

## Quality gates / commands

At the M00-01 baseline, `pnpm typecheck`, `pnpm test` and `pnpm build` exist;
the test runner covers seven workspace checks. Lint, Vitest, integration/E2E
scripts and CI are not yet configured. Apply B0 before M00-05 with actual direct
proof; never claim future commands passed. Once established, B requires relevant
lint/typecheck/unit/build and mapped integration/E2E/specialized suites. Missing,
failed, skipped or flaky required checks block delivery; unavailable future
tooling is explicitly NOT_APPLICABLE_YET. Discover actual script names, not
assumed `test:integration` or `test:e2e` commands. Never fabricate green CI.

## Test data

Synthetic only; accounts CAD, CNY, JPY, loan/card, month boundary, leap day, negative/zero, overflow, concurrency, refunds, duplicate API retries, double allocations, scenario modifications, migration rollback. Maintain fixture documentation and deterministic clock.

## Step reviews

Each task's acceptance and central matrix specify focused tests and regression
radius; the milestone timeline covers all endpoint gates. No task is Verified
solely because code was generated. Track human UX acceptance separately from
automated assertions. After all required local/review gates pass, include test
evidence/status in one logical task commit, push the authorized current branch,
check exact-SHA CI and stop. No automatic merge, release or deployment.
