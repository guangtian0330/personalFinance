# Proposed AGENTS.md addendum — review and merge, do not overwrite

This addendum complements the existing repository `AGENTS.md` created by M00-BOOTSTRAP-000. Review conflicts before merging.

## Execution gate
- Exactly **one authorized Step per user turn**. A step is identified by `tasks/Mxx/Mxx-yy.md`.
- Load the current Step and only its `Source docs`/code/tests; do NOT preload full PRD or all tasks.
- No automatic transition to the next Step, no automatic Git push, production deployment, live credentials, cloud services or real personal financial data.
- If a requirement is unapproved or conflicts with the code, return an issue/ADR proposal instead of silently changing fundamental architecture.
- Do not rerun M00-BOOTSTRAP-000; inspect and reuse existing repo, branch, status, files, and commits.

## Architecture invariants
- Domain code does not depend on UI, HTTP, Cloudflare, or ORM.
- Account ledger is the financial source of truth. Virtual goal allocations do NOT create assets or cash; no double-counting.
- Cross-currency entries must preserve original units and explicit FX conversion; never sum different currencies directly.
- Money amounts use minor-unit integers; input/output format and safe range are explicit.
- Refunds, reversals, migrations, and goal reassignments are auditable.
- Mock auth is local/test-only and fails closed in production. Every API resource is authorized by trusted server-derived workspace membership.
- Algorithms have provenance, version, assumptions, rounding, edge cases, and deterministic test vectors. Product policy != scientifically derived parameter.
- Suggestions never cause money transfer or committed plan changes without explicit user confirmation.

## Per-step lifecycle
1. Inspect git status, requested task ID, dependencies, touched files.
2. Plan smallest change and checks.
3. Implement scope only, with associated tests and schema/contract documentation when needed.
4. Run available format/lint/typecheck/unit, and integration/e2e tests when affected and available; report NOT RUN honestly.
5. Review changed files and diff for sensitive data.
6. Update existing `docs/PROJECT-STATUS.md` and task completion markers, preserve user edits.
7. Report changes, commands, test results, remaining issues, next suggested Step; STOP.
8. Commit only when task/user explicitly authorizes, never push automatically.

## Parallelism
- Default serial, one implementation agent; single integrator on main.
- Optional 2–3 concurrent agents **only** if tasks have satisfied dependencies, stable API/contracts, separate worktrees/branches and disjoint file ownership. No parallel migrations/shared contract edits.
- Parallel read-only research and reviews are preferred over parallel mutable changes. Never let two agents edit same worktree.

## File/secret safety
- Never commit real statements, credentials, SSH keys, `.env`, local database data, exported records or user identifiers.
- Avoid destructive Git commands and force-push.
- Windows PowerShell / Windows Native workspace: `D:\myWORK\project\finpath`.
