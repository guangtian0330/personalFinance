# FinPath delivery roadmap — executable dependency milestones

This is a **complete planning breakdown**, not permission to run all tasks. 53 Step files in `tasks/M00` through `tasks/M09`. Current repo already completed `M00-BOOTSTRAP-000`; do not rerun. The first new task is `M00-01` once user approves the design baseline.

As of the 2026-10-30 QA-policy baseline, M00-01 is locally Verified and delivered
in `ea5c7c9dd0ad0a4018c1d3c6323790d383f20468`; M00-02 onward are not completed.
Use root [TEST-MILESTONES](../../../../docs/testing/TEST-MILESTONES.md) for the
Step-relative gate timeline and manual checklists,
[TASK-TEST-MATRIX](../../../../docs/testing/TASK-TEST-MATRIX.md) for all 53 rows,
and [QA-EXECUTION-RULES](../../../../docs/testing/QA-EXECUTION-RULES.md) for
verification, ordinary Git delivery and CI/human state handling.

| Milestone | Count | Responsibility | Exit gate |
|---|---:|---|---|
| M00 | 5 | monorepo, build, contracts, auth stub, CI | front/back smoke, mock fail closed |
| M01 | 6 | precise Money, accounts, double-entry ledger | transfer/income/expense invariants |
| M02 | 5 | categories, budgets, period summaries | budget actual equals ledger source |
| M03 | 5 | onboarding, feature visibility, recommendations | reversible user setup, no auth bypass |
| M04 | 6 | simple/composite goals, reservations, 3-goal cap | no asset double counting and atomic quota |
| M05 | 6 | documented scoring & allocation proposals | deterministic and feasible / user-confirmed |
| M06 | 5 | forecasts, scenarios, life-event budget conversions | baseline unchanged by simulations |
| M07 | 5 | asset reporting, FX snapshots, portable data | accurate export/re-import and disclosures |
| M08 | 5 | real auth and tenant security | cross-tenant E2E / production mock disabled |
| M09 | 5 | cloud rollout, integration, loads, recovery, review | explicit secure launch approval |

Execution order default M00 → M01 → M02 → M03 → M04 → M05 → M06 → M07 → M08 → M09.
`tasks/INDEX.md` specifies exact prerequisite edges; display order adds none.
All 53 current task/manifest entries are nonparallel; hypothetical disjoint work
requires a later explicit authorization with stable contracts and separate
worktrees. This roadmap does not itself authorize parallel implementation.

## Release definition

- Internal demo: M00–M03 with synthetic data.
- Planning proof-of-concept: M04–M05 with deterministically tested virtual pools.
- Extended beta: M06–M07 with synthetic records and import/export.
- Public authenticated release with real data: M08+M09 mandatory; secure backup, privacy and monitoring.

All demos/betas before production authorization are local or separately
authorized controlled environments using synthetic data. Public mock identity
is forbidden. A push or green CI is not a deployment grant. Final user review
and separate explicit tag/release/deployment execution authorization remain
mandatory; do not create cloud resources from this roadmap.

## Step stop condition

After one authorized task's required checks/reviews pass, update evidence,
create its logical commit and push the current authorized branch under the
standing user grant; inspect exact-SHA CI, report and STOP. Failure means the
corresponding BLOCKED/PUSH_PENDING/CI state, not a skipped test, weakened
invariant or next task. Bare "continue" is not next-Step authorization. Parallel
activities require approved separate branches/worktrees and an integrator.
All operations remain Windows native; verify remote and never re-clone.

## Tracking

Root `docs/PROJECT-STATUS.md` is the authoritative progress record. Include task
ID, local results, branch, pending human gates and blockers in the same task
commit; report its actual SHA and push/CI result afterward rather than putting
an unknown self-referential hash in the commit. Keep prior history. Task index
markers change only with verified implementation evidence; publishing this QA
plan completes no implementation Step.
