# Deployment and platform plan

## Local-first development environment (not product offline-first)

Windows Native PowerShell, repo `D:\myWORK\project\finpath`. Git SSH remote `git@github.com:guangtian0330/personalFinance.git` if verified locally. Node LTS per tool compatibility; pnpm selected in M00-01. Keep Node versions pinned using standard config and lockfile; `pnpm install --frozen-lockfile` on CI. Codex does not reinitialize Git or move folders.

## Target Web stack

React + Vite static assets, Hono Worker API, Cloudflare D1 (SQLite-style database) through Drizzle. Hosting choice is *proposed* and may change with workload or auth constraints. D1 local dev and hosted use separate bindings/DBs. Migrations tested both in local SQLite-compatible integration and D1 target where feasible.

Cloudflare Workers Free 2026-10: 100,000 requests/day and 10ms CPU per request; check current policy before deploy. Request-level optimization and stochastic scenarios are not suitable for an assumed free synchronous Worker without benchmarks.

## Environments

- Development: fake users, seeded artificial transactions, temporary DB.
- Staging: authentication enabled, no unprotected public MockAuth; synthetic data only until security verified.
- Production: isolated DB, controlled migrations, platform secrets, custom domain/TLS, observability with sanitized logs, migration backups and rollback plan.

## Later platforms

Tauri Windows packaging: reuse web app and typed API, but actual offline persistence requires separate sync/merge architecture. WeChat Taro: build dedicated mini-program UI; reuse domain contracts/API and only platform-neutral business logic. Browser DOM UI cannot simply be copied over.

## Release checklist

CI green, dependency license/SBOM reviewed, API/DB migrations validated, tenant E2E checks, privacy export, recovery rehearsal, limit load test, hosting costs/quotas reviewed, deployment rollback documented, user sign-off. Never auto-deploy from a Step unless explicitly requested.

Sources: https://developers.cloudflare.com/workers/static-assets/ ; https://developers.cloudflare.com/workers/platform/limits/ ; https://developers.cloudflare.com/d1/platform/limits/ .
