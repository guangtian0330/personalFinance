# GOAL_PRIORITY_MCDA / GOAL_HORIZON v1

**Status: Proposed product policy, not an empirically validated optimal weighting.** Method family MCDA from government guidance. AHP only P2 option, not needed for onboarding.

## Candidate scoring

Inputs for eligible discretionary top-level goals: user Importance `I ∈ {1,2,3,4,5}`, dynamic Urgency `U ∈ {1..5}`, user/derived DelayCost `D ∈ {1..5}`. Initial policy weights `w=(0.45,0.35,0.20)` normalized sum 1. `P=0.45I+0.35U+0.20D`, result in [1,5], display two decimals, internal decimal exact. User may adjust weights subject to nonnegative/sum=1 check. Use stable tie-break by nearer hard deadline, then creation date, then opaque id. Do not use weights as allocation percentages.

Importance anchors: 1 nice-to-have, 2 low impact, 3 meaningful comfort/ability, 4 major household effect, 5 essential long-term outcome. DelayCost: 1 trivial deferral, 2 small inconvenience, 3 material trade-off, 4 significant financial/life loss, 5 severe or irrecoverable. Mandatory legal/contractual bills and emergency reserve floor are excluded from subjective scoring and treated as constraints.

Urgency is **funding pressure**, not just a count of days: explicitly take account of deadline, remaining target minus reserved funds and estimated safe capacity. MVP v1 may implement a transparent rule table with unit tests. Proposed anchors: 1 funded or comfortably on-track, 2 on track with slack, 3 mild projected gap, 4 target at risk, 5 deadline imminent and plan materially underfunded. No user-specific economic consequences inferred without supporting data. If no deadline or insufficient projected cash data, mark estimate uncertain and ask for assumption; do not silently assign 5. Past due => dedicated `overdue` status, not divide by zero.

Dynamic horizon bucket: short if `date <= today + 3 calendar years`, medium if `>3 and <=5 calendar years`, long otherwise; convert by calendar operations, not fixed 365 days/year. Missing deadline => unspecified horizon. Recompute labels on date change; historical classification stored in snapshots where appropriate.

## Example vector

`(I,U,D)=(3,5,4) => P=3.90` ; `(5,2,3)=>3.55` ; `(2,3,1)=>2.15`.

Properties: monotonic in each factor; bound [1,5]; normalized weights; stable ties; funded goal urgency low or excluded from new funding. Sensitivity: test if small weight change reverses first place; notify user if decision fragile. Any production automation must store weights/version with plan.

## Evidence and limitation

UK government MCDA manual: https://www.gov.uk/government/publications/multi-criteria-analysis-manual-for-making-government-policy
Saaty AHP (future): https://doi.org/10.1287/mnsc.32.7.841
This proves neither the chosen weights nor the subjective anchors' predictive accuracy; validate with usability feedback and transparent overrides.
