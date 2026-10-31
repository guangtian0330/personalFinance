# FinPath agent protocol

## Authority and context

- Repository files, not conversation memory, are the durable source of truth.
- A human-approved PRD governs product behavior; approved architecture and ADRs
  govern technical choices; module contracts govern interfaces. The approved
  Step limits edit scope and cannot silently override any higher-level rule.
- The delivered PRD, architecture, algorithms and 53-Step index live in
  `.ai/FinPath_Delivery2_v1/`, the user-designated source for subsequent tasks.
  Resolve a delivery Step's `docs/...` and `tasks/...` links within that directory.
  Read its `AGENTS.ADDENDUM.md` with this protocol. Only an explicitly requested
  Step is authorized; the rest of the baseline remains proposed. Do not infer
  blanket product approval from the delivery or a milestone name.
- Read this file, the explicitly requested Step, its referenced contracts,
  architecture/algorithm documents, then directly relevant code and tests. Read
  the full PRD only to resolve ambiguity or conflict.
- Maintain specifications and Step order in the delivery's `docs/` and `tasks/`
  directories. Keep progress in root `docs/PROJECT-STATUS.md` and navigation in
  root `tasks/README.md`; avoid duplicate authoritative specification copies.

## One approved Step per session

1. Identify the exact task ID, approval state and prerequisites. Stop if the
   specification is unapproved or a prerequisite is missing; report the blocker.
2. Inspect Git status, branch, relevant architecture/contracts and files.
3. Present a short plan covering files, interfaces, invariants and verification.
4. Edit only files required by the current Step. Preserve existing work and avoid
   unrelated refactors. Contract and DB migration changes require their own
   explicit review/checkpoint.
5. Run relevant formatting, lint, type checks and unit tests when available.
   Run integration/E2E checks for affected cross-module flows. State unavailable
   checks honestly; a green unit suite alone does not verify integration.
6. Inspect diffs and staged/untracked filenames for secrets, real data, unsafe
   migrations, regressions and unexpected changes. Stage only task-owned files.
7. After verification, update project status and the task index. Report changed
   files, behavior, commands/results, contracts, limitations, blockers and the
   suggested next Step. Distinguish planned work from verified results.
8. Commit only on user request or explicit authorization in the current Step.
   Never push, create a PR, publish or deploy automatically.
9. STOP. A new explicit user instruction is required for another Step.

Each future Step must declare: `taskId`, `milestone`, `goal`, `requirements`,
`prerequisites`, `sourceDocs`, `allowedFiles`, `protectedFiles`, `inputs`,
`outputs`, `contracts`, `invariants`, `implementationScope`, `outOfScope`,
`testCommands`, `acceptanceCriteria`, `completionReport`, `parallelizable`,
`conflictRisk`. Use independently verifiable vertical slices. Track `Proposed`,
`Approved`, `In Progress`, `Blocked`, `Completed` and `Verified` separately.

## Parallel work

- Default to one implementation agent and one Step. Bootstrap and financial
  ledger/domain-invariant work run sequentially.
- Consider 2–3 parallel agents only after the baseline, stable contracts and
  tests exist, with satisfied prerequisites and disjoint ownership. Prefer
  read-only research or review when algorithm or security decisions are uncertain.
- Parallel code writers require separate feature branches and separate Git
  worktrees. Never let two agents mutate one worktree concurrently. One integrator
  reviews and merges, then runs the complete tests. Avoid simultaneous migrations
  or shared-contract edits. Parallelism can increase token/tool consumption.

## Git, privacy and release safety

- Preserve history, remotes, local changes and untracked user files. Do not rename
  `personalFinance`, silently relocate the Windows-backed project, or overwrite
  existing work. Do not use destructive reset/clean commands or force pushes.
- Inspect the current branch; keep mainline buildable. Use a feature branch for
  implementation, defaulting to `codex/` unless explicitly instructed otherwise.
- Never invent Git identity or credentials. Report missing configuration. Use
  small focused commits, preferably `type(scope): description`.
- The repository may be public. Never commit credentials, keys, real financial
  or identity data, `.env` files, local databases, imports, exports or backups.
  An `.env.example` must contain synthetic/non-secret examples only. Ignore rules
  are not a substitute for inspecting content. Use synthetic fixtures only.
- Mock authentication is local/test only and must fail closed in production.
- No public deployment or real-user data collection until production auth,
  server-side tenant authorization, privacy and backup/restore checks pass.

## Future financial invariants — record now, implement only in approved Steps

- Virtual goal allocations do not create assets or double-count cash.
- Transfers and investment purchases are not ordinary consumption expenses.
- Financial records belong to a user/household tenant; server-side authorization
  is mandatory before public launch.
- Every financial algorithm needs sources or explicitly labeled product
  assumptions, a version, units, rounding rules, edge cases and tests.
- Recommendations cannot silently move money or change confirmed financial plans.
- Proposed business rules, including the three-active-top-level-goal limit,
  remain subject to human approval.
