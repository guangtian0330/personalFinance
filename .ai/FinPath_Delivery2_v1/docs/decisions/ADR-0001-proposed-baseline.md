# ADR-0001 — Proposed modular-monolith baseline

- Status: Proposed, pending user approval.
- Context: Solo developer assisted by Codex, limited context/usage budget, web first, future Windows and mini-program, sensitive financial information.
- Decision: strict TypeScript packages with pure core; React+Vite web, Hono API, Drizzle/D1 persistence; REST contracts and tenant-aware schema; no microservice deployment. Event history for posted finance and allocations.
- Consequences: lower initial setup overhead, explicit module boundaries and deterministic unit testing; provider migration requires adapter work; 10ms free Worker CPU budget requires lightweight server algorithms.
- Alternatives: Next.js+Supabase (more built-in auth/Postgres, different hosting concerns), Node+PostgreSQL VM (operational overhead), C++ backend (lower code reuse for web UI and API at this stage).
- Review trigger: API performance failure, data model migration pressure, offline sync requirement, security incompatibility or hosting quotas.
