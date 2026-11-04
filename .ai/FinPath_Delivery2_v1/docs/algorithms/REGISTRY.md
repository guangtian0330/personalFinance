# Algorithm registry & governance

All financial calculations require an algorithm ID, semantic version and spec. Three evidence classes:

1. `ACCOUNTING_IDENTITY`: mathematical/bookkeeping invariant, proved by balance equations.
2. `REFERENCE_METHOD`: research-supported family (MCDA, AHP, goal programming), but not necessarily calibrated product coefficients.
3. `PRODUCT_POLICY`: UX/business choice (3 active goals, weights, default reserves), explicitly marked non-scientific/adjustable.

| Algorithm ID | V1 | Evidence class | Owner doc | Scope |
|---|---|---|---|---|
| MONEY_MINOR_UNITS | 1.0 | ACCOUNTING_IDENTITY | REPORTS | cash precision/scale |
| LEDGER_BALANCE | 1.0 | ACCOUNTING_IDENTITY | REPORTS | posting balance and net worth |
| BUDGET_VARIANCE | 1.0 | ACCOUNTING_IDENTITY | REPORTS | actual-budget |
| GOAL_HORIZON | 1.0 | PRODUCT_POLICY | PRIORITY | date horizon buckets |
| GOAL_MONTHLY_NEED | 1.0 | financial arithmetic | ALLOCATION | target gap/remaining months |
| GOAL_PRIORITY_MCDA | 1.0 | REFERENCE_METHOD + PRODUCT_POLICY | PRIORITY | score, not shares |
| SAFE_CASH_FLOW | 1.0 | cash flow accounting + PRODUCT_POLICY | FORECAST | reserve floor and monthly capacity |
| GOAL_ALLOC_RULES | 1.0 | PRODUCT_POLICY, future optimization | ALLOCATION | feasible proposal under cap |
| SCENARIO_CASHFLOW | 1.0 | simple forward projection | FORECAST | detached what-if |
| FX_REPORTING | 1.0 | conversion/accounting policy | REPORTS | reporting currency with provenance |
| RETIREMENT_RUNWAY | future | scenario model | FORECAST | future lifetime budget |
| GOAL_OPTIMIZATION | future | academic method, not packaged implementation | SOURCES | LP/MILP/dynamic programming |

## Template for each algorithm

- algorithmId, version, status, human-readable objective.
- exact inputs with units and precision; missing/invalid behavior.
- formula/pseudocode and invariant; expected result shape.
- assumptions, defaults, user-configurable policy, known limitations.
- cited method/papers or explicitly labeled self-designed choice.
- positive, negative, zero, borderline and property-based test vectors.
- performance budget and storage of chosen version / parameters / input hash.

Historical accepted plan retains algorithm id/version, parameters and input snapshot/hash; upgrading formula does not rewrite old decisions. A research paper supports the **method class**, not the 45/35/20 weights or choice of 3 simultaneous goals.
