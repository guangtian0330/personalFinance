# FinPath — System architecture

## Architecture decision

Modular monolith, contract-first, strict TypeScript. `apps/web`: React + Vite, Tailwind/shadcn/ui; `apps/api`: Hono HTTP API on Cloudflare Workers (deployment target); `packages/contracts`: Zod validated request/response schemas and error types; `packages/core`: pure domain models and algorithms; `packages/persistence`: Drizzle repository implementations with SQLite/D1; `packages/ui`: shared React UI primitives.

Cross-platform clients can reuse `packages/core` and contract schemas, but not assume React DOM components run in WeChat mini programs. Future Tauri requires offline data/sync decisions; do not prematurely build a sync platform.

## Dependency rules

`web -> contracts`, optionally `core` **only** for pure client-side previews; web never accesses D1 directly.
`api -> core + contracts + persistence`. `persistence -> domain interfaces` (no circular dependency). `core -> no framework, HTTP, ORM, cloud APIs, browser globals`. Services injected with repository, clock, exchange rate, algorithm registry, auth providers; side effects isolated.

## Request path

Browser -> Hono router -> authentication/session -> trusted workspace resolver -> Zod validation -> use case -> domain policy -> repository transaction -> response schema. Client-provided tenant/workspace selectors must be validated against membership; every query scoped by trusted tenant context.

## Canonical workflows

Income expense -> journal postings -> categorized report. Budget -> category & period -> actuals derived from journal. Goal -> reserved virtual cash -> allocation proposal -> user confirmation -> funding plan, NOT actual bank transfer. Forecast -> verified recurring cash items plus user assumptions -> scenario, never a real transaction until independently recorded.

## Deployment modes

- Local dev: mocked auth, seeded synthetic data, local test DB.
- Preview: synthetic users or fully authenticated protected staging; never expose local MockAuth publicly.
- Production: real auth, tenant isolation, backups, secret management, migrations, monitoring, error logging without sensitive payloads.

Cloudflare Workers Free CPU limit is a deployment constraint; heavy multi-goal optimization runs in browser worker or future paid/isolated compute only after security and performance review.

## Contracts/changes

Schema changes require versioned migrations and tests. API contracts are versioned; failed validations return typed errors; backward-compatible amendments preferred. Breaking domain changes require explicit ADR and task re-plan. One Step at a time, integrations in M01, M04, M05, M09.

## Non-goals

No microservices, no Kubernetes, no event bus, no message broker, no premature browser offline sync, no brokerage transactions. Smaller components and explicit DB transactions are enough for V1.
