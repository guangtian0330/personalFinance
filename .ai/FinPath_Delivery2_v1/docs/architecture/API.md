# REST API contracts — `/api/v1`

The M00-03 foundation contract below was reviewed and approved by the repository
user on 2026-10-31 (America/Toronto). The remaining business endpoints and
policies in this document are proposed, not approved or implemented by M00-03.

All payloads validated with Zod schemas in `packages/contracts`. JSON money uses decimal-string `amountMinor`, ISO-4217 `currency`, and `asOf` for dated valuations. Timestamps UTC ISO-8601. Never silently drop unknown sensitive fields. Uniform error:

```json
{"error":{"code":"GOAL_ACTIVE_LIMIT","message":"At most 3 top-level goals may be Active","details":{"limit":3},"requestId":"..."}}
```

HTTP conventions: 400 invalid syntax, 401 unauthenticated, 403 unauthorized (or 404 when hiding existence), 404 absent, 409 conflict/duplicate, 422 valid syntax but invalid domain action, 429 throttled, 500 unexpected with no sensitive stack. API versions via `/api/v1`; no destructive changes without version plan. POST mutation may use `Idempotency-Key` and ETag/version when relevant.

## M00-03 foundation contract

Scope: local liveness and a stateless validation example only. No authentication,
tenant data, storage, financial operation or production deployment is introduced.
The exact schemas and inferred types live in
[`packages/contracts/src/index.ts`](../../../../packages/contracts/src/index.ts).

| Method / path | Request | Success |
|---|---|---|
| GET `/api/v1/health` | No body or query parameters | 200 `{"status":"ok","service":"finpath-api"}` |
| POST `/api/v1/health/check` | `Content-Type: application/json` (charset allowed), exactly `{"check":"health"}`, no query parameters | Same 200 body; no state changes |
| GET `/health` | Existing M00-02 compatibility route | Same 200 body; existing query handling retained |

The two versioned examples reject unknown query names, including empty names.
Malformed/empty JSON, wrong value types, missing/unknown body fields, and missing
or unsupported JSON media type return 400. Client-supplied `actorId` and
`workspaceId` are unknown fields, never authorization. Outside the M00-04 private
namespace (whose auth ordering is specified below), the version-prefix query
check runs before route resolution: a rejected query returns 400 even on a
missing route. Otherwise unregistered method/path combinations return 404;
POST `/health` remains 404. Health success responses have exactly the two
declared fields. All responses use `Cache-Control: no-store`.

The error envelope is exactly:

```json
{"error":{"code":"INVALID_REQUEST","message":"Invalid request.","details":{},"requestId":"00000000-0000-4000-8000-000000000003"}}
```

The UUID above is a synthetic fixture. The server generates a fresh UUID for each
request, returns it in `X-Request-Id`, and repeats it in the error body. Incoming
request IDs are not trusted or echoed. Error `details` is required and **empty**
in this Step; unknown error fields are rejected by the contract.

| HTTP status | Stable code | Fixed public server message |
|---|---|---|
| 400 | `INVALID_REQUEST` | `Invalid request.` |
| 404 | `NOT_FOUND` | `Resource not found.` |
| 500 | `INTERNAL_ERROR` | `An unexpected error occurred.` |

Unexpected exceptions become the 500 envelope. Exception messages, stack traces,
causes, Zod issue objects and input values are never serialized into errors.
The M00-04 addition below supplies 401. Other proposed HTTP/domain codes remain
future work.

The Web adapter uses this prefix and validates requests and responses at runtime.
Valid API errors become `ApiError` with status, code and request ID. Malformed or
unexpected responses, including mismatched error code/status, become
`InvalidApiResponseError`. Transport/cancellation failures retain their reason.
The existing UI keeps its three-second timeout and retry behavior. Vite forwards
both `/health` and `/api/v1` in development and preview. Root dev commands build
the contracts package first, including on a checkout without compiler output.

Synthetic valid/invalid fixtures and inferred-type probes are in
[`M00-03.contracts.test.mjs`](../../../../packages/contracts/tests/M00-03.contracts.test.mjs)
and [`M00-03.fixtures.mjs`](../../../../packages/contracts/tests/M00-03.fixtures.mjs).
API and client boundary tests cover malformed/unknown input, sanitized 400/404/500
responses, legacy compatibility and cancellation during response-body reading.
See [project status](../../../../docs/PROJECT-STATUS.md) for actual verification.

Contract checkpoint **APPROVED** under
[QA execution rules](../../../../docs/testing/QA-EXECUTION-RULES.md#evidence-and-human-review).
Reviewer: repository user. Date: 2026-10-31 (America/Toronto). Evidence: after
receiving the concrete contract and passing verification report, the user replied
"评审通过 批准" in this conversation. Approved scope: the routes, strict field/query
validation, response/error shapes, empty details and status/code mapping in this
section. This approval does not extend to the proposed business APIs below.

## M00-04 local authentication boundary

This Step adds `UNAUTHENTICATED` with HTTP 401 and fixed public message
`Authentication required.` to the shared error schema/map. The existing empty
`details`, server-generated request ID and error sanitization rules remain.
The Web client recognizes this additive error code without UI changes.

GET `/api/v1/private/health` is a read-only protected smoke route returning the
existing `HealthResponse` on success. With no verified identity it returns 401.
The whole `/api/v1/private/*` namespace authenticates before query validation,
including anonymous POST and requests with unknown tenant selectors. After
authentication, unknown queries return 400 and unsupported methods/routes 404.
Existing public health and missing-route behavior remain unchanged. No `/me`,
profile, account, session issuance or financial-resource API is implemented.

[`AuthContext` and `AuthProvider`](../../../../packages/core/src/auth/index.ts)
are platform-neutral interfaces. `authenticate(credential)` returns a trusted
actor plus one resolved workspace or null. The credential is opaque and
untrusted; the default provider rejects every value. The API passes the
Authorization header to the provider without treating it as verified identity.
A future real provider must validate credentials and workspace membership.
Only validated, non-empty actor/workspace fields are copied into a frozen
per-request context; missing context fails closed. Client actor/workspace
headers, cookies, query fields and body fields do not establish tenant scope.

The explicit local mock returns only `synthetic-local-developer` and
`synthetic-local-workspace`. It ignores supplied credentials. Tests inspect its
context with test-instance-only routes; no identity-debug endpoint is shipped.
See [security configuration](SECURITY.md#m00-04-local-mock-boundary) and the
[PowerShell instructions](../../../../README.md#local-authentication-smoke-m00-04).

Manual contract checkpoint: **WAIVED_BY_USER** for this Step. On 2026-11-01 the
user instructed "继续执行。并且跳过人工审核的部分。" after M00-04 was identified as
the next Step. This is an explicit waiver, not a fabricated review PASS. Required
automated security/contract checks still run; release restrictions remain.

## Identity/profile / feature

| Method / path | Request | Response | Permission |
|---|---|---|---|
| GET `/health` | none | `{status:'ok',service:'finpath-api'}` (M00-02 compatibility) | public |
| GET `/me` | session | `{user,workspaces}` | authenticated |
| GET/PUT `/preferences` | `{view, featureIds, reportingCurrency,timezone}` | versioned preferences | workspace member |
| POST `/onboarding` | `{householdScope,needs[],nearGoal?}` | `{recommendations[],preferences}` | own workspace |
| GET `/features` | none | manifest + status + rationale | own workspace |

## Ledger and budget

| Method / path | Request | Response |
|---|---|---|
| GET/POST `/accounts` | account create `{name,kind,currency,liquidityClass}` | account list/object |
| GET `/accounts/:id/balance` | asOf? | `{amountMinor,currency,asOf}` |
| GET/POST `/transactions` | create `{kind,occurredAt,postings[],categoryId?,memo?}` | validated journal / paged history |
| POST `/transactions/:id/reverse` | `{reason}` plus expected version | reversal transaction |
| GET/POST `/categories` | category tree/create | list/object |
| GET/POST `/budgets` | budget draft `{periodStart,periodEnd,currency,lines[]}` | budget version |
| POST `/budgets/:id/activate` | `{expectedVersion}` | activated version |
| GET `/budgets/:id/variance` | period and category keys | `{plannedMinor,actualMinor,varianceMinor}` |

Domain postings API in initial version may be used only internally; public UI should offer simple transaction form adapter that produces balanced journal safely. Never expose arbitrary unrestricted posting ability to ordinary users.

## Goals and planning

| Method / path | Request | Response |
|---|---|---|
| GET/POST `/goals` | `{title,type,targetMinor,currency,deadline,components?}` | goal details |
| PATCH `/goals/:id` | `{expectedVersion,patch}` | updated goal with event |
| POST `/goals/:id/transition` | `{to,reason,expectedVersion}` | state change or `GOAL_ACTIVE_LIMIT` |
| GET `/goals/:id/progress` | none | `{targetMinor,reservedMinor,remainingMinor,monthlyNeedMinor?,horizon}` |
| POST `/goal-allocations/preview` | `{sourceAccountId,goalId,amountMinor,action}` | feasibility + reasons |
| POST `/goal-allocations/confirm` | `{previewId,expectedVersion}` | immutable allocation event(s) |
| POST `/funding-plans/preview` | `{goalIds[],forecastHorizon,overrides?}` | `{algorithmId,version,inputsHash,lines[],warnings[]}` |
| POST `/funding-plans/:id/confirm` | `{expectedVersion}` | accepted plan without real bank transfer |
| GET/POST `/scenarios` | scenario assumptions | detached results |

## Reports/import/export

| Method / path | Contract |
|---|---|
| GET `/reports/cash-flow?period=...` | explicit reporting currency, date, FX assumptions |
| GET `/reports/net-worth?asOf=...` | per-currency totals and optional reporting-currency converted totals |
| POST `/imports/csv/preview` | validate row map and proposed posting count; no writes |
| POST `/imports/csv/commit` | checks idempotency and preview hash |
| GET `/exports/backup` | authenticated versioned JSON, no secrets |
| POST `/backups/validate` | verify schema and totals prior to privileged restore |

## Security and pagination

Every private endpoint requires server-derived workspace membership; client-supplied IDs are resource keys, not authorization. Lists use cursor pagination and bounded page size; large exports are authenticated and rate limited. All mutation responses return stable IDs and revisions; no client may unilaterally specify `actorId` or trusted `workspaceId`.

## Version/test contract

`packages/contracts` contains canonical zod validators and TS inference, at least one valid and invalid fixture per endpoint. Client API typed from these definitions; integration tests verify status/error code and cross-workspace rejection. This file specifies behavior, not necessarily final generated schema syntax; Step M00-03 owns the exact types.
