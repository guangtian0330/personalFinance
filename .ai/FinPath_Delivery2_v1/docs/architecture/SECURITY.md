# Security and privacy architecture / release gates

## Threat model

Assets: transactions, balances, tax/identity metadata, goals, household relationships, backed-up exports, authentication secrets, rate limits. Adversaries: anonymous actors, compromised sessions, malicious member abusing shared space, accidental cross-tenant query, stored XSS, leaked environment variables, compromised developer machine.

## Minimum guarantees

1. MockAuth permitted only with explicit local dev flag and no publicly reachable host, **fail closed** for deployed preview/production.
2. Server validates session; resolves actor and workspace membership on every request. Auth != authorization.
3. All DB selects, joins, mutations filter by workspace, and cross-workspace foreign key pairing is checked.
4. User-controlled text must be escaped, XSS mitigated via safe components and CSP where practical.
5. Strong session cookies, secure/HttpOnly/SameSite configuration as provider supports, CSRF defenses for cookie-auth mutations, logout invalidation.
6. Rate limiting on login, password reset and bulk API endpoints; generic error messages preventing account enumeration.
7. Secrets in platform secret store; never source control or logs. Do not store real personal data in fixture databases or screenshots.
8. Financial corrections and accepted plans audited. Sensitive metadata redacted in telemetry.
9. Users can export and request deletion; clear retention policy before launch.
10. Backup encryption, recovery testing and environment segregation; do not promise recovery without a tested backup.

## Security acceptance test matrix

- Anonymous GET/POST private endpoint -> 401.
- Authorized A fetching B's account by UUID -> 404/403, response and timing do not leak balances.
- A creating a transaction with B's account ID -> reject, no partial postings.
- Attempted unsupported goal allocation to restricted retirement asset -> reject.
- Production config enabling mock identity -> boot failure.
- Session change / stale ETag / double-click -> no duplicate mutation.
- CSV formula injection during export -> escape per safe CSV rules.
- Backup access -> explicit auth + audit + high-risk confirmation as needed.
- Data exfiltration via error stack, logs, analytics -> test redaction.

Security review benchmark: OWASP ASVS (check selected version at implementation). Threat model and risk controls evolve as credentials/hosting choices are approved. **No public launch with real data before M08 and M09 pass.**

## M00-04 local mock boundary

The local Node adapter keeps its listener fixed at `127.0.0.1:8787` and derives
configuration only from process environment. Mock authentication is off by
default. Enabling it requires all of the following:

- The trusted entrypoint explicitly selects `runtime: 'local-node'`.
- `APP_ENV=development` and exactly `MOCK_AUTH=true`.
- `NODE_ENV` is unset or exactly `development`.

Production, preview, staging, test, unknown/missing APP_ENV, conflicting NODE_ENV,
and malformed flags fail startup before listening when mock is requested.
MOCK_AUTH may be unset or exactly `false` to retain the anonymous provider in
any environment. No credential is accepted by that default provider.

The portable default handler always uses the anonymous provider. Worker-style
bindings become available only at dispatch: any attempt to set MOCK_AUTH=true
(even with a development label) yields a sanitized 500 before routing. A local
mock instance rejects auth-related runtime bindings rather than mixing deployment
configuration with local startup settings. Startup mode is captured once, so
mutating the caller's config cannot remove the request guard.

For mock-protected requests, the URL origin and any supplied Origin/Host must
match the fixed local development origins `http://127.0.0.1:8787`,
`http://127.0.0.1:5173` or `http://127.0.0.1:4173`. External/null Origins,
cross-site fetch metadata and Forwarded/X-Forwarded-* host/proto/for hints are
rejected. A command-line request may omit Origin. These are additional browser
and rebinding checks, never credentials or evidence that a process is local.
Do not expose mock mode via a tunnel or public reverse proxy; headers can be
rewritten by proxies and cannot establish network isolation.

The auth port lives in pure core; API middleware owns HTTP handling and copies
only trusted actor/workspace values into each request. There is no database,
real identity provider, verified session or cross-resource tenant authorization
yet. The protected health route and isolated synthetic-context tests provide
only the M00-04 portion of IT-005; they do not verify the later financial-data
isolation scenario or production security.

The user explicitly waived the M00-04 manual checkpoint on 2026-11-01. Record
this as WAIVED_BY_USER; no human security signoff or release approval is implied.
Automated configuration, missing/forged identity, context isolation, real HTTP
and prior regression checks remain mandatory. The implementation reference is
[OWASP ASVS 5.0.0](https://asvs.owasp.org/downloads/) (stable release checked
2026-11-01), not a claim of complete ASVS compliance. Hono request scoping follows
its [context](https://hono.dev/docs/api/context) and
[middleware](https://hono.dev/docs/guides/middleware) interfaces.
