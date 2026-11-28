# GOAL_MONTHLY_NEED / GOAL_ALLOC_RULES v1

## Explicit distinction

`priority score` ranks discretionary choices; `minimum recommended monthly contribution` estimates a goal's deadline requirement; `allocation engine` enforces budget, liquidity and max-active-goals constraints. These quantities are separate.

## Inputs

Planning asOf date, horizon months, per-month safe allocatable cash `C[t]`, goal candidate set, targetMinor, reservedMinor, remainingMonths, goal score, account restrictions, optional user-protected contribution, state and priority override.

## Monthly need (zero-return MVP)

`gapMinor = max(0,targetMinor-reservedMinor)`.
If `gap=0` -> funded/no new contribution. If `months <= 0` and gap > 0 -> `Overdue/ImmediateFundingNeeded`, do not divide. Else `minimumMonthlyMinor = ceil(gapMinor / months)` in minor units (ceil so funding not short by rounding). No annual growth assumed. This is an estimate not a return forecast.

## Deterministic allocation baseline

1. Fail closed if cash flow/eligibility assumptions are invalid; provide warnings rather than silent zero or fabricated coverage.
2. Satisfy minimum reserve and committed obligations outside goal engine; `C[t] >= 0` by construction; future negative cash is a risk state, not a negative allocation.
3. Filter funded, canceled, executing, ineligible and expressly locked goals; score discretionary candidate goals; retain user-protected constraints as explicit policy.
4. Select up to 3 top-level eligible goals. If too many protected selections or hard requirements conflict with cash, return `INFEASIBLE` with reasons, not an arbitrary fallback.
5. Sort by priority and need/urgency, consider per-goal deadline; allocate month t to suggested required monthly targets in rank order until `C[t]` exhausted. Remaining resources to eligible user-designated long-term goal or uncommitted cash according to preference. No claim this greedy algorithm is mathematically optimal.
6. Propose pause/deferral with goal by goal missed-amount and ETA estimates; never mutate goal state from preview.
7. User confirms explicit plan version. Recorded plan is an *internal intention*; account money remains unchanged unless a separate actual financial transaction takes place.

Future upgrade: multi-period feasibility using LP/MILP or dynamic programming; change in policy requires algorithm version and A/B comparison tests. Avoid introducing GPL-constrained solvers without license review.

## Important invariants

`Σ allocated(goal_i,t) <= safe_cash[t]`. `allocated >= 0`. Active top-level count `<=3`. Reserved total per source eligible account cannot exceed available eligible balance (and must be concurrency-safe); no “fund both with the same CAD 100”. A plan cannot pledge restricted pension assets for nonqualified spending. A paused goal retains existing reservations unless user explicitly transfers them.

## Test vectors

V1: CAD 12,000 car gap, 12 months => CAD 1,000/month; CAD 3,600 trip, 18 months => CAD 200/month; with C=CAD 2,000/month, remaining CAD 800 may go to retirement as preferred.
V2: C falls to CAD 1,000 and user chooses car deadline as priority => car 1,000, trip 0, retirement 0 proposed; plans not committed without confirmation.
V3: reserve 5,000, account cash 5,000 => sixth dollar reservation rejected; assets unchanged.
V4: four Active top-level goals attempted => 4th transition rejected atomically.
V5: gap 1 cent, 3 months => 1 cent/month with intentional overfund prevention at final month.
V6: due today, gap positive => overdue, no division by zero.
V7: two goals in different currencies => no comparison/allocation without an explicit dated reporting/FX plan and account suitability checks.

## Research links

Das et al., Journal of Banking & Finance 140 (2022) 106192: https://doi.org/10.1016/j.jbankfin.2021.106192
Capponi & Zhang, Management Science 70 (2024): https://doi.org/10.1287/mnsc.2022.02047
These support the importance of multi-goal dynamic optimization; they do NOT certify this simple greedy baseline.
