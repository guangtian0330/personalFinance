# FinPath Step-based QA milestones

Effective: 2026-10-30. This is a validation timeline, not a calendar commitment
or permission to execute the 53 tasks. Source order/prerequisites come from the
[delivery index](../../.ai/FinPath_Delivery2_v1/tasks/INDEX.md) and
[manifest](../../.ai/FinPath_Delivery2_v1/tasks/MANIFEST.json). Follow the
[execution rules](QA-EXECUTION-RULES.md) and each [matrix row](TASK-TEST-MATRIX.md).

Only M00-01 has implementation evidence at authoring time: commit
`ea5c7c9dd0ad0a4018c1d3c6323790d383f20468`, pushed to
`origin/codex/m00-01-workspace`. Every gate below is a future requirement, not a
completed test or human acceptance. Bootstrap is outside the 53-Step count.

## Chronological gates

Levels and severity S/H/C are defined in the execution rules. All required local
failures block Step delivery. U is a separate human UX gate; R is required review
before Verified. Every row uses synthetic data and retains prior invariants.

| Endpoint | Levels / severity | Developer-run exit proof | Human gate | Deployment eligibility after gate |
|---|---|---|---|---|
| M00-02 | L0–L3 / H | Documented Windows process launch, `/health` JSON, web→API success/failure smoke, build; capture endpoints and owned-process cleanup | U: dev smoke checklist | Local development only; not a release gate |
| M00-05 | L0–L3 / C | Before delivery: frozen install, actual lint/typecheck/unit/build, API+UI smoke, workflow configuration review and production mock flag fails closed. After push: required CI passes for that exact SHA before milestone closure / dependent Step | R for any unresolved contract/config review | Local synthetic demo; no public mock identity |
| M01-06 | L0–L2 / C | Per-currency balanced replay; transfers preserve net worth; refund/reversal/card settlement/precision/retry cases; IT-001 ledger subset | R if storage/ledger policy remains unresolved | Local synthetic accounting only |
| M02-05 | L0–L3 / C | IT-001 budget subset, journal-derived actual, no transfer/card-payment double expense, version/timezone/month boundary regressions | U: budget reconciliation | Local synthetic demo; no financial-data release |
| M03-05 | L0–L3 / H | Playwright UF-01 skip/restore/restart/toggle flows, keyboard/mobile/accessibility and telemetry privacy; financial data survive off/on | U: onboarding/features | Local synthetic UX demo |
| M04-06 | L0–L3 / C | IT-002/003; reservations leave assets unchanged; no excess after concurrent reserve/withdrawal; fourth active rejected atomically; child not counted | R for cap/shortage policy; U: goals | Local planning proof-of-concept |
| M05-06 | L0–L3 / C | IT-004 shock proposal; deterministic replay/version/trace; feasible nonnegative allocations; no silent pause/transfer/plan mutation; sensitivity explanation | U: allocation proposal | Local synthetic planning proof-of-concept |
| M06-05 | L0–L3 / C | IT-004/007; scenario hash/journal isolation, recurring-time boundaries, car/retirement previews and effective-date budget history | No extra U prescribed; apply prior UX gates | Extended synthetic beta only, no public mock |
| M07-05 | L0–L3 / C | Full IT-001 reporting reconciliation plus IT-006/008; dated FX/provenance/incomplete flag; malformed/duplicate import handling; restore counts/totals and currency accuracy | U: reporting/portability | Synthetic beta; release still requires M08/M09 |
| M08-05 | L0–L4 / C | IT-005 across reads/writes/list/export/import/goals; real sessions/roles, mock rejection, redacted logs, rate/deletion negatives, versioned OWASP-oriented control evidence | U: auth/isolation; unresolved provider design requires R | Security prerequisite only; production still forbidden |
| M09-02 | L0–L3 / C | Complete IT-001–005 on the integrated app, preserving per-currency balance and no overfund/double expense; retain IT-006–008 regression results from prior gates | Prior UX approvals must be accounted for | Only separately authorized controlled staging |
| M09-03 | L0–L4 / C | Approved workload/threshold vs measured latency/resource/quota/concurrency results; current source/date for platform limits and over-limit behavior | R: workload and acceptance limits | No claim of release or unlimited free capacity |
| M09-04 | L0–L4 / C | Independent clean-target restore, canonical counts/totals/history comparison, corrupt/incomplete backup rejection, executable runbook and measured recovery results | R: independent recovery review | Recovery prerequisite only; no production deployment |
| M09-05 | L0–L4 / C | All gates traced; unresolved critical items absent; permitted noncritical deferrals explicit; privacy/auth/recovery/performance and human evidence reviewed | R+U: explicit final user release review | Release-ready proposal only; actual tag/release/deploy needs separate explicit authorization |

M09-01 is a prerequisite of M09-02, not a release shortcut: prepare reproducible
build/migration/deployment instructions and validate only in an already authorized
controlled environment. Creating cloud resources, deploying preview/production,
using credentials or uploading real data is not authorized by the standing push
policy. Missing required environment means `BLOCKED_ENV`.

## Integration-contract completion map

Use the original [IT-001..IT-008 contracts](../../.ai/FinPath_Delivery2_v1/docs/testing/INTEGRATION-ACCEPTANCE.md).
Record partial coverage as partial; never mark an entire scenario passed while
its later module is absent. Each final gate reruns affected previously accepted
cases, not just the newly written assertions.

| Scenario | Progressive proof | Completion / regression gates |
|---|---|---|
| IT-001 | M01-06 ledger and transfer/net-worth; M02-05 budget reconciliation | M07-05 includes reporting; full integrated rerun M09-02 |
| IT-002 | M04-03 reserve/release/reassign without creating assets | M04-06; regress M05-04/06 and M09-02 |
| IT-003 | M04-04 fourth-active race and child counting | M04-06; regress M05-04 and M09-02 |
| IT-004 | M05-03/04 capacity shock, M05-05 preview/confirm | M05-06; scenario extension M06-05; full rerun M09-02 |
| IT-005 | Local trusted synthetic authorization boundaries from M00-04/M01-04; these are not production-auth evidence | Real provider/session and all resources at M08-05; full rerun M09-02 |
| IT-006 | M07-03 malformed/duplicate import; exporter/restore contract in M07-04 | M07-05; independent restore drill M09-04 |
| IT-007 | M06-04 effective retirement version and preserved history/goals | M06-05; retain through final release review |
| IT-008 | M07-02 dated FX, units, rounding and unknown basis/FX | M07-05; retain through final release review |

## Human/manual acceptance checklists

For each U gate, start with its exact verified build/revision in a documented
local/authorized test environment and a reset synthetic fixture. Record tester,
date, browser/viewport, steps, expected/actual results, sanitized evidence and
PASS/FAIL/PENDING. No real bank records, identities or production credentials.
Automated E2E results remain separate from this human record.

1. **M00-02 — dev smoke.** Follow README in a fresh PowerShell session; launch
   API/web; inspect expected health JSON and web connection result; stop API and
   observe understandable failure; restore it and confirm recovery; stop owned
   processes. Pending U blocks later user-facing work using this connection flow
   (including M01-05); foundation non-UX work may proceed only when authorized.
2. **M02-05 — budget/ledger.** With a fully documented synthetic opening fixture,
   enter groceries CAD 300, refund 30 and owned-account transfer 2,000; verify
   groceries net expense 270 and no transfer expense. Inspect card settlement
   using its explicit prior liability; switch reporting periods and budget
   versions; confirm prior history and currency labels. Pending U blocks later
   dashboard/budget-consuming UX work, including M03-04 and M04-05.
3. **M03-05 — onboarding/features.** Skip all optional answers, refresh midway,
   edit an answer, decline a recommendation, switch an optional module off/on;
   confirm discovery and existing data survive. Navigate by keyboard and mobile
   viewport; inspect sanitized telemetry for sensitive-answer leakage. Pending U
   blocks later UI relying on this navigation/feature configuration, including
   M04-05; it does not assert an authorization policy change.
4. **M04-06 — goals/funding.** Reserve CAD 3,000+2,000 from 5,000; attempt extra 1;
   verify cash/net worth unchanged and the extra reservation rejected. Release
   500 and inspect history. Activate three top-level goals, attempt a fourth,
   then pause one and explicitly confirm a new activation; verify components do
   not consume slots. Inspect the approved withdrawal-shortage behavior. Pending
   U blocks allocation-confirmation UX work at M05-05.
5. **M05-06 — allocation.** Reproduce capacity 2,000 and proposed car 1,000,
   trip 200, retirement 800; reduce scenario capacity to 1,000 with the documented
   car-priority assumption and inspect proposed 1,000/0/0. Cancel and verify the
   accepted plan/journal are unchanged; confirm a reviewed version and inspect
   algorithm/version/actor history without any bank transfer. Pending U blocks
   life-event confirmation UX at M06-03/M06-04.
6. **M07-05 — reports/data.** View native JPY/CAD balances separately, inspect
   dated FX/provenance, remove a rate and see an incomplete result. Dry-run
   malformed and duplicate CSV input without partial commit; export the complete
   synthetic fixture, restore to a clean test workspace and compare counts,
   balances and reservations. Inspect formula-leading CSV cells safely. Pending
   U blocks data-portability release acceptance and M09-05 readiness.
7. **M08-05 — authentication/isolation.** Use synthetic users A/B in separate
   workspaces in controlled staging. Exercise login/logout/recovery, expired
   session, guessed B ID from A, lists/exports/imports and role restrictions;
   verify no B data, no token in logs, and generic errors. Confirm production/mock
   configuration fails closed. Pending U blocks release readiness, not permission
   to deploy a public mock demo.
8. **M09-05 — final review.** Human owner reviews the exact candidate revision,
   prior UX records, full E2E, security, measured quotas and independent restore
   evidence. List all deferrals with reasons; reject unresolved critical/safety
   gaps. Record explicit acceptance or required fixes. This R gate is part of
   Step acceptance and blocks Verified/commit/push while pending. A favorable
   review authorizes a release proposal only; execution of tag/release/deploy is
   a separate explicit instruction with a reviewed destination and configuration.

Manual decisions do not change task IDs or declared prerequisites. The U gates
add acceptance constraints to the named consuming UX work and release, not an
automatic authorization to run another task. Rejected UX must be corrected in
authorized scope and rechecked; an assistant cannot mark a pending human result
passed. Tests with synthetic UI confirmations do not satisfy human review.

## Entry and release controls

- Verify task dependencies using the index/manifest/Step, not file existence.
  M03-01 explicitly needs M00-05 and M02-05; M04-01 needs M02-05, not M03-05.
  Preserve those edges while applying the relevant UX gates above.
- Financial property test fixtures need explicit currency scale, integer bounds,
  timezone, opening balances, actor/workspace, rounding and algorithm version.
  Test same-currency postings and valuation boundaries now; cross-currency
  settlement remains P1 under DOMAIN until separately designed and authorized.
- M08-02's staging need predates M09-01. Record an existing authorized environment
  or block; do not interpret this timeline as permission to create one.
- A local demo, synthetic beta, successful commit/push or successful CI is not
  public release permission. Public real-data use requires production auth and
  resource authorization, privacy, backups/recovery and M08/M09 evidence, final
  human approval, and a separate explicit execution request.
- Run only document/link/coverage checks for authoring this plan. No gate above
  is marked passed by creating these documents.
