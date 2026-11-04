# Accounting and reporting calculations v1

## Money

Store money in minor-unit integer `amountMinor`. JSON transports it as integer decimal string. Currency scale from ISO-4217 metadata (`CAD=2`, `CNY=2`, `JPY=0`); all values labeled with currency. Addition requires identical currency; integer overflow/unsafe number conversions rejected. Non-integral FX results rounded at conversion boundary by a declared mode (baseline half-even, configurable per policy), never rounded each intermediate operation silently.

## Double-entry

For each posted journal and each currency: `Σ(debits_minor) = Σ(credits_minor)`. Posting amount positive, sign determined by debit/credit and account type. Account balance is sum signed postings, not user-editable total. Assets = liabilities + equity plus income/expense changes in accounting equation (depending on close period). Net worth = assets - liabilities at a chosen as-of date, converted only with explicit FX rates. Treat negative asset balances according to account policy, not always an error (overdraft option).

## Income and expense

For a selected interval and reporting scope, cash-basis income and recognized living consumption are derived from Income and Expense postings; transfers between owned accounts do not count. An investment purchase swaps assets; realized gains require basis information and distinct events, not counting the full proceeds as income. Loan principal is balance reduction, interest is cost. Credit card spend recognized at purchase, payment of the card debt is settlement, not second expense.

## Budget variance

`varianceMinor = actualExpenseMinor - budgetedExpenseMinor`, positive = overspend, negative = underspend. A refund reversing an actual expense reduces net expense for the documented reporting period. Reserving savings for future costs is NOT an incurred expense. Avoid counting a transaction both in a child and parent category aggregate.

## Savings rate (specified product metric)

`periodSavingsMinor = netCashIncomeMinor - recognizedConsumptionMinor` for tracked period, excluding portfolio valuation effects; make treatment of debt interest, capital repayments and taxes explicit in the report. `savingsRate = periodSavings / positiveNetIncome`, otherwise undefined/not reported; may differ from actual net worth movement because of FX, asset revaluations, gifts and adjustments.

## Net-worth movement

`change = newNetWorth - priorNetWorth`. Report components where source data support them: net contributions/withdrawals, realized investment return, unrealized mark-to-market, FX translation and unexplained reconciliation difference. Do NOT guess unknown basis or value changes are investment profit.

## Example edge tests

- CAD 1000 cash -> transfer CAD 200 between owned accounts -> net worth remains CAD 1000.
- Card purchase CAD 40 -> expenses +40 and liability +40; paying card later moves cash/liability, no second +40 expense.
- Loan repayment CAD 500: 450 principal and 50 interest -> recognized expense 50, liability reduced 450.
- Expense CAD 120, refund CAD 20 -> net expense 100 if in same reporting period.
- JPY 100 and CAD 100 -> cannot report `200` without dated FX conversion.
