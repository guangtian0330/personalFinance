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
  architecture/algorithm documents, its own row in
  [TASK-TEST-MATRIX](docs/testing/TASK-TEST-MATRIX.md) and applicable
  [TEST-MILESTONES](docs/testing/TEST-MILESTONES.md), then directly relevant code
  and tests. Read the full PRD only to resolve ambiguity or conflict.
- Maintain specifications and Step order in the delivery's `docs/` and `tasks/`
  directories. Keep progress in root `docs/PROJECT-STATUS.md` and navigation in
  root `tasks/README.md`; avoid duplicate authoritative specification copies.
- [QA-EXECUTION-RULES](docs/testing/QA-EXECUTION-RULES.md) is the canonical local
  gate, evidence, human-review and Git-delivery protocol. The user's 2026-10-30
  standing authorization supersedes generic no-push/fresh-permission wording in
  older Delivery2 templates/addendum/bootstrap instructions only for ordinary
  verified Step delivery. Product, security and release restrictions still apply.

## One approved Step per session

1. Identify the exact task ID, approval state and prerequisites. Stop if the
   specification is unapproved or a prerequisite is missing; report the blocker.
2. Inspect Git status, branch, relevant architecture/contracts and files.
3. Present a short plan covering files, interfaces, invariants and verification.
4. Edit only files required by the current Step. Preserve existing work and avoid
   unrelated refactors. Contract and DB migration changes require their own
   explicit review/checkpoint.
5. Run relevant formatting, lint, type checks and unit tests when available.
   Apply the matrix's risk-based integration/E2E/security/load/restore gates.
   Distinguish pre-M00-05 future tooling from missing required checks; failed,
   skipped, flaky or unavailable required checks block delivery. A green unit
   suite alone does not verify integration. Use synthetic data only.
6. Inspect diffs and staged/untracked filenames for secrets, real data, unsafe
   migrations, regressions and unexpected changes. Stage only task-owned files.
7. After verification, include project status and task markers in the same task
   commit. Keep local verification, delivery, CI and human acceptance separate;
   never invent human signoff or embed a commit's own unknown SHA in its contents.
8. Under the standing user request, every successfully verified Step ends with
   one logical task commit and an ordinary push to its current authorized remote
   branch. Stage explicit task-owned paths; inspect the staged diff and secrets.
   No commit/push on required local check failure. Preserve the local SHA on push
   failure; retry the same delivery, not duplicate implementation/commits. Check
   required remote CI after push for that SHA; failures/pending required CI block
   milestone closure and the next Step, not creation of the initial commit.
   No automatic force-push, merge, PR, tag, release, deployment or cloud resources.
9. Report changed files, behavior, commands/results, contracts, commit SHA,
   remote branch/push, CI/manual status, limitations and next suggested Step.
   STOP. A new explicit Step instruction is required; bare "continue" is not one.

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
