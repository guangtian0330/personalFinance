# Physical database design — proposed D1/SQLite schema

This is a **logical and migration design**, not directly executable SQL. Codex M01/M04/M08 creates D1-compatible Drizzle schema and tests. Do not pretend D1 is identical to local SQLite/Postgres across every feature.

## General conventions

Tables: snake_case, plural. IDs: stable opaque text (`uuid`/ULID) generated server-side; `workspace_id` text REQUIRED on every business record. Money: SQLite signed INTEGER minor-units when values fit; request/response serializes integer as decimal string. Event timestamps UTC ISO. Soft-delete/archival only where defined; journal reversals preferred to deleting financial history. Unique indexes include tenant keys. Foreign keys, checks and uniqueness constraints wherever supported.

## Baseline tables

| Table | Keys / representative columns | Constraints and use |
|---|---|---|
| users | id, email_normalized, auth_provider_subject, created_at | email uniqueness per identity provider; avoid storing password without audited auth adapter |
| workspaces | id, name, reporting_currency, timezone, created_by | tenant root |
| memberships | workspace_id, user_id, role, status | composite unique; role `owner|editor|viewer` extensible |
| accounts | id, workspace_id, name, account_kind, currency, liquidity_class, archived_at | type `asset|liability|equity|income|expense`; UI financial accounts map to internal posting accounts |
| journal_transactions | id, workspace_id, actor_id, kind, occurred_at, status, description, reversal_of_id, idempotency_key, created_at | unique workspace+idempotency_key; posted/reversed append-only |
| postings | id, workspace_id, transaction_id, account_id, side, amount_minor, currency, category_id | >0 amount; account/workspace match, currency consistency; transaction balancing via service and tests |
| categories | id, workspace_id, parent_id, flow_type, slug, name, archived_at | flow_type `income|expense`; parent within workspace |
| budget_versions | id, workspace_id, period_start, period_end, currency, version, state, effective_at, created_by | immutable once superseded; unique (workspace,period,version) |
| budget_lines | id, workspace_id, version_id, category_id, planned_minor, rollover_policy | non-negative planned, category valid |
| goals | id, workspace_id, title, goal_type, currency, target_minor, deadline, importance, delay_cost, state, top_level_parent_id, version | max 3 Active top-level via atomic policy/transaction, not just a UI guard |
| goal_components | id, workspace_id, goal_id, type, amount_minor, budget_spec_json, responsibility | no duplicate top-level funding mapping |
| goal_events | id, workspace_id, goal_id, actor_id, prior_state, new_state, rationale, at | append-only state history |
| allocation_events | id, workspace_id, event_group_id, source_account_id, goal_id, action, amount_minor, currency, actor_id, at | effective reservations computed from ledger of events; no asset inflation |
| funding_plan_versions | id, workspace_id, algorithm_id, algorithm_version, input_hash, policy_json, created_at, accepted_at, accepted_by | proposal vs accepted state immutable history |
| funding_plan_lines | id, workspace_id, plan_version_id, goal_id, month, proposed_minor, reason_codes_json | sum monthly ≤ safe cash budget |
| recurring_rules | id, workspace_id, entry_kind, category_id, amount_minor, currency, frequency, next_date, confidence | projections only, no posted journal until actual event |
| scenarios | id, workspace_id, baseline_snapshot_id, changes_json, created_by, created_at | sandbox, never writes real ledger |
| snapshots | id, workspace_id, as_of, kind, currency, data_json, source_version | reproducible reporting/history |
| fx_rate_snapshots | id, base_currency, quote_currency, as_of, rate_decimal, source | record date/provenance, do not auto-infer execution rates |
| import_batches | id, workspace_id, hash, source_label, status, created_by, created_at | idempotent preview/import, no actual user secrets in logs |
| audit_events | id, workspace_id, actor_id, action, resource_kind, resource_id, timestamp, metadata_redacted_json | no full sensitive payloads |

## Invariants and transaction boundaries

- Journal transaction is created atomically with all postings; each currency balances (`debit == credit`). FK ownership validated in service/repository.
- Goal state + active quota checked/changed atomically; concurrency races are tested. D1 concurrency behavior must be assessed in implementation; no assumption that a query-then-insert without lock is safe.
- Reservation event and available funds validation atomic. For aggregate reservations, strong check via transaction and retry/conflict policy.
- Account balance = signed posting sum; never separately mutate a balance cache without reconciliation. If summary cache introduced, it is derived and rebuilding is tested.
- Standard imports are non-destructive; dry run and duplicate reconciliation before acceptance.
- Production migrations are versioned, reviewed, backed up, and replayable in local tests.

## Tenant and access index plan

Indexes at least `(workspace_id, occurred_at)` for journal, `(workspace_id, account_id)` postings, `(workspace_id, state)` goals, `(workspace_id, source_account_id)` allocations, `(workspace_id, period_start,period_end)` budgets. Public API uses trusted context; `WHERE workspace_id = ...` mandatory on every read/update/delete. Foreign keys must prevent cross-tenant references.

## Versioning / future migration

Personal-first MVP still creates one personal workspace per user. Household member access later uses memberships and per-account visibility rules; this requires explicit authorization tests. Do not auto-convert old personal data to shared without user consent.
