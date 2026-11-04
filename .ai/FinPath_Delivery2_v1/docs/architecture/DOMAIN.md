# Domain boundaries & invariants

## Aggregates

- Identity/Workspace: User, Workspace, Membership, Role, AuthSession.
- Ledger: Account, JournalTransaction, Posting, Category, PostingTag, IdempotencyKey.
- Budget: BudgetVersion, BudgetLine, BudgetActualQuery; budget is not its own financial ledger.
- Goal: Goal, GoalComponent, GoalStateEvent, AllocationEvent, FundingPlan, FundingDecision.
- Planning: RecurrenceRule, CashFlowForecast, Scenario, LifeEvent, ForecastSnapshot.
- Reports: ReportingPeriod, MoneySummary, FxRateSnapshot, NetWorthSnapshot.

## Financial source of truth

Each journal transaction has at least two postings with debit/credit sides, positive minor-unit amounts and a single currency per posting. Within each currency, debit total equals credit total. Internal ledgers include Asset, Liability, Equity, Income, Expense. Opening balances must have matching equity postings. Period report maps to relevant income/expense postings, not simple account delta.

Investment purchases and transfers move assets, not ordinary income/expenses. Principal repayment reduces liability, interest is expense. Cross-currency settlement cannot fake a same-currency balanced transfer: use currency bridge/clearing journal design and record FX rate/fees, with each currency's postings balanced. V1 step M01-06 explicitly verifies same-currency operations; cross-currency execution is reserved for P1 until proper bridge accounting exists.

Corrections: reversal linked to original; no silent permanent mutation of posted journal. Idempotency key prevents retry double-post. Treat journal dates in stable UTC timestamps with explicit local reporting timezone (user setting); never assume UTC calendar day equals local budget day.

## Virtual reservations

AllocationEvent has accountId, goalId, action (`reserve|release|reassign`), amount/currency, committedAt, linked decision. Reassignment modeled as release+reserve atomic with shared event group. Sum of active reservations per eligible liquid account ≤ account's available allocatable balance after account restrictions; no negative reservations. They never alter ledger account balance. FundingPlan is a **future internal savings intention**, not actual transfer.

## Goals

Top-level only counts toward maximum three ACTIVE. Component shares parent lifecycle unless explicitly promoted through validated conversion. Funded/Executing/Paused/Queued do not count. Valid transitions declared in Goals module; atomic DB update for active quota and reservations. Deadline horizon computed dynamically. Impossible plans return a reason rather than fabricated completion.

## Budget and lifetime events

BudgetActual derived from journal expense categorization including refund semantics; `budget` records planned ceilings and version history. LifeEvent proposes a new version, user confirms effective period, historic budgets remain unchanged. Retirement can coexist with other active family obligations.

## Precision, time and currency

`Money { amountMinor: string (decimal integer on JSON), currency: ISO-4217 }`; domain uses checked integers (`bigint` or safe bounded integer), no binary floating-point for cash. All rounding rules declared; currency scale via ISO table; do not store `CAD` 2-decimal assumptions on JPY. DB SQLite INTEGER is signed 64-bit; conversion must reject unsafe JS integer ranges and preserve exact units. FX rates use Decimal string, value date and provenance, explicit rounding at conversion boundary.

## Safety / audit

Every write is scoped to authorized workspace and actor. Posted transactions and accepted planning decisions are timestamped and user traceable. Request replay and concurrency must not violate 3-active-goals or exceed available earmark balances. No silent edits of data/history.
