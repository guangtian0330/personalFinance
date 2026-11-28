# SAFE_CASH_FLOW / SCENARIO_CASHFLOW v1

## Safety before allocation

For planning month t, estimated `free[t] = expected_net_cash_receipts[t] - essential_cash_outlays[t] - mandatory_debt_payments[t] - already_committed_irregular_expenses[t] - reserve_replenishment_needed[t]` with conservative handling for uncertain receipts. Distinguish scheduled outgoing payments from internal earmarks. Avoid subtracting gross taxes/pension twice if receipts are already net salary. Reports distinguish actual transaction, projected rule, and user scenario assumption.

Liquidity reserve floor in one reporting currency: `requiredReserve = estimated_essential_monthly_outflow × user_selected_months`; do not label a chosen 6 or 12 months as a mandatory standard. Project `cash_balance[t]` and floor over multiple months. Monthly safe allocation may be limited by future liquidity troughs; not just immediate cash. Missing recurring bills or unknown FX results in `insufficientData` or stated uncertainty.

## Risk labels (product policy)

`HEALTHY`: projected liquid balance at/above floor and no deficit for chosen horizon.
`TIGHT`: projected buffer below policy warning threshold or approaching floor; warn and advise reduced discretionary contribution.
`CRITICAL`: projected negative liquid balance, unmet essential outflow, or floor violation designated critical by user policy.

Do not fabricate a numerical probability from these labels. Warning thresholds, lookback and replan cooldown are user-configurable product rules; do not thrash Active/Pause on small volatility.

## Projection

Input recurring rule (monthly/quarterly/annual etc.), verified start, frequency, stop date, amountMinor, currency, confidence; time-zone-aware month boundaries. One-off future expenses supported. Scenarios are clones/overlays: changing scenario must not mutate journal, budget or accepted plan. Forecast returns by-month receipts, outlays, liquidity, free, warnings, inputHash/version and provenance.

## Retirement preview (P1/P2)

Nominal expense in year n: `E_n = E_0*(1+inflation)^n` if constant scenario inflation; actual needs depend on user categories, age and region. Project income from pensions/work/other, cash withdrawal and portfolio return assumptions separately; no default assertion of guaranteed returns. Multi-year scenarios must allow uncertain horizon/expenses and report possibility of failure rather than precise guarantee.

## Tests

0 revenue, positive essentials -> negative free and CRITICAL; net paycheck already excludes contributions -> no duplicate subtraction; annual insurance in target month -> reduced safe cash; scenario adds lost income -> baseline unmodified; leap year + local monthly boundary; zero/unknown FX -> explicit limitation; tiny noise under threshold -> stable recommended goals.
