# FinPath — Product Requirements Document (PRD) v1.0

Status: **Proposed implementation baseline; user acceptance required before irreversible design choices.** 2026-10-27.

## 1. Vision

FinPath is an easy-to-use, goal-driven personal and household finance operating system. It combines personal accounting and budgeting with planning for short-term (≤3 years), medium-term (>3 to ≤5 years), long-term (>5 years) goals. The UI is simple and progressive; the underlying computation must remain auditable and deterministic.

The system answers: (a) Where is my money? (b) What was income, consumption, transfer, net worth change, and cash flow? (c) What goals do I have and when? (d) Which should receive scarce discretionary cash now? (e) How do planned life events change future costs? The service never moves real funds.

## 2. Personas and access

- Beginner: record income/expenses and see a clear monthly overview without accounting jargon.
- Planner: save for car, trip, wedding, education or home; wants at most 3 funded top-level goals concurrently.
- Household manager: budgets for multiple adults/dependents; permissions and shared costs are later additions.
- Advanced: investments, currencies, retirement, alternatives, rolling forecasts.

Initial product: responsive Web, private test with synthetic data; public usage with real data **blocked** until production auth, server authorization, secure deployment, backup/recovery gates pass. No regulated investment advice, bank transfers, securities orders, auto-tax returns or direct credential collection.

## 3. Information architecture and gradual disclosure

Primary entry points for beginners: Home, Transactions, Budgets, Goals, More. `Accounts` can surface from transactions; advanced tools hidden under More, not deleted. The initial 3-step onboarding asks only household scope, current finance priority, optional near-term goal; every question skippable. Contextual, optional questionnaires are activated only when users explore marriage, children, retirement, etc.

FeatureManifest fields: featureId, status (available/comingSoon), dependencies, visibility preference, entitlement/permission constraints, description, entrypoint and recommendation rules. Recommender results are explanations, not authorization and never force-open a module.

User can always browse and manually enable modules. Disabling a module hides entry points while retaining data/history. No sensitive inference is required to open features.

## 4. Financial truth / reporting

Accounts (cash, deposit, checking, investment, loan, card) have workspace ownership, currency, account type, liquidity restrictions and status. Financial transactions are immutable/auditable postings; corrected entries use reversal, not silent deletion. Income/expense categories and tags support up to three levels and custom names. Transfer and investment purchases are not ordinary consumption; liability principal is distinct from interest expense; refunds are countertransactions.

Budgets: monthly/annual per category, budget versions, planned vs actual, optional accrual-like reserve labels and transparency on cash vs expenditure. Reports: net income/expenses, period savings, account balances, assets/liabilities, net worth, net cash movement; no universal numerical aggregate across currencies without explicit conversion rate/date.

Starter income taxonomy: salary, bonus, self-employment, side gig, business, interest, dividends, rent, pension, gifts, reimbursement, other. Starter expense taxonomy: housing, food, transportation, insurance, medical, education, personal, digital services, entertainment, travel, family, tax, gifts, financial fees, other. Tags: essential/discretionary, recurring/one-off, fixed/variable, household member (future), linked goal.

## 5. Goal framework

Goal: unique ID, workspace, title, type (simple/composite), target amount/currency, deadline, user importance, delay cost, due-date flexibility, current reserved balance, lifecycle state, priority override, funding policy and algorithm version history. Composite Goal has optional components, weights/periods; top-level only counts toward max active cap. A component may become a separate top-level Goal only by explicit user action and funding deduplication checks.

Lifecycle: Draft → Queued → Active → Paused → Funded → Executing → Completed; Cancelled from eligible states. User may revise dates/targets with version history. Funded/Executing/Paused do not count as actively receiving discretionary contributions. Short/medium/long classification recalculates from remaining date, never erases history.

Money pools are virtual earmarks linked to eligible real accounts, never duplicate assets or silently move bank money; fund, release, reassign are logged. Funds restricted by account type/withdrawal limits cannot be freely earmarked for unrelated goals.

Goals library: trip, car, home, moving, wedding, child/education, retirement, care, health, career, debt, business, sabbatical, family support, philanthropy, custom. See `FEATURE-CATALOG.md` and `USER-FLOWS.md` for per-type details.

## 6. Three active goals / allocation

Initial proposed cap: 3 simultaneously Active top-level goals across a workspace, configurable only in later policy versions. Emergency operating reserve and required debt/essential expenses are **constraints** rather than consuming a goal slot. System scores optional goals by importance, dynamic deadline pressure/underfunding, and cost of delay (proposed 0.45/0.35/0.20; product assumption). Score ranks; it is NOT a funding percentage.

Available cash is calculated from verified/predicted net receipts, essential spending, obligations, upcoming commitments, and reserve floor across the planning horizon. Missing information must lead to uncertainty warnings rather than false certainty. Engine proposes up to 3 funded goals, monthly contribution amounts, pauses/deferrals, and “why”; user previews side effects and accepts the suggested plan explicitly. No actual transfers. Frozen or user-protected goals need consent before contribution changes.

## 7. Composite life-event templates

**Retirement:** accumulation → transition → drawdown; budget components housing, food, utilities, transport, medication, care, leisure, travel, tax, family support (all selectable). Inputs: planned retirement age/date, expenses by year, inflation assumption, pension/other income, life horizon, market return assumptions. Activation creates a new effective budget template after consent and preserves historic budget/transactions. Drawdown is a forecast/plan, not automatic money movement.

**Raising children:** birth preparation, 0–3, 3–6, 6–18, adult education; distinguish essential and enrichment education, care, health, food, clothing, travel. Multiple children can share household bills without double counting; age shifts are planned events.

**Wedding:** registration, ceremony, meals, photography, gifts/jewelry, customs (dowry/bride price where applicable), honeymoon, new home and furniture. Optional responsibilities by contributor; housing may be linked separate top-level goal and must not duplicate savings.

**Car:** purchase cost incl. fees/down payment, insurance, maintenance, fuel/charging, parking, depreciation reporting (not expense cash) and future replacement; purchase completion suggests ongoing operating-budget template.

**Housing & relocating:** down payment, closing costs, mortgage, renovation, furnishing, moving; recurring post-purchase costs and financing simulation are separate from immediate cash goal.

Other templates: family care, medical, professional training, career break, business startup, travel, emergency reserve, charitable giving.

## 8. Transactions, identity, data and security

Local development may use deterministic MockAuth; it must reject production build/config. Future identity: email/password or passkey/OAuth based on selected provider, account recovery, sessions, signout, delete/export, multi-tenant workspace membership and eventual household roles. Every database access and API endpoint validates server-derived workspace membership; a client-supplied `workspaceId` is never proof of authorization.

Support manual entry, synthetic data fixtures, CSV preview/import with dedup, CSV/JSON export and restore rehearsal, backup policy, privacy controls. Reporting currency is a view/currency conversion with provenance, not reclassification of original transaction currency.

## 9. User-visible workflows and quality

See `USER-FLOWS.md`. Every goal edit/plan change has before/after preview, explainability, and confirmation. Error states are actionable; UI usable by keyboard and screen reader, responsive and progressively disclosed. All calculations show units, rounding, applied assumptions, as-of time and source.

Availability objective: never lose accepted financial entries; avoid double submit and duplicate import. Integrity objective: journal balances, goal reservation constraints, and authorization invariants must be provable in tests. Non-functional: deterministic domain calculations, migrations tested, strong CI, backups restorable, dependency licenses reviewed and WCAG 2.2 AA design target.

## 10. Release strategy and out of scope

- P0: account ledger, budgets, onboarding, feature preferences, goals, up to 3 active goals, safe funding recommendations, simple reporting and secure authenticated release.
- P1: comprehensive templates, forecast/scenarios, family roles, holdings, multi-currency performance analysis, recurrence and life-event transitions.
- P2: LP/MILP/dynamic planning, Monte Carlo probabilities, offline sync, WeChat/Tauri clients, external feeds.

Detailed 53-step delivery scopes are recorded in `tasks/INDEX.md`. Features that are P1/P2 may have only a **foundation or preview** in the 53-step initial program; completing all steps is not a claim to deliver every P1/P2 feature.

## 11. Outstanding decisions

The architecture baseline is a proposal. Before public launch confirm with owner: hard cap 3 vs configurable, household sharing schedule, true base currency strategy, auth provider, backup retention, public/private code license, use of investment returns in goal forecasts, offline-first scope, UX wording. See `docs/decisions/OPEN-DECISIONS.md`.

## 12. Acceptance release gate

A first publicly usable version requires: full ledger-to-budget-to-goal acceptance flow; balance and reserved-funds invariants; no secrets in repo; no cross-workspace reads or writes; production disables mock auth; recoverable backup; verified runtime and database limits; usable error handling; basic accessibility; license review; all critical tests passing; explicit user approval for launch.
