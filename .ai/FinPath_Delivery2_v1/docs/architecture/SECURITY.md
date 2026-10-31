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
