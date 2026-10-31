# FinPath project status

Updated: 2026-10-31 (America/Toronto).

## Current stage

- Task: `M00-01` — pnpm workspace and strict TypeScript.
- State: Verified; explicitly authorized by the user on 2026-10-30.
- Prerequisite: `M00-BOOTSTRAP-000` Verified; bootstrap changes were later
  committed/pushed as `022cae4f5d04c4611791b515d8c8bb054354f58b`.
- Specification source and task order: `.ai/FinPath_Delivery2_v1/`, as designated
  by the user. Step source links are relative to that directory. This delivery
  remains a proposed baseline except for the explicitly authorized current work.
- Next suggested task: `M00-02`, awaiting a new user instruction; not executed.

## QA milestone / Git policy authoring (documentation only)

- Authorization: user invoked `.ai/FinPath_QA_Milestones_Codex_Prompt.md` after
  separately delivering M00-01. This is not an M00–M09 implementation Step.
- Precondition confirmed at task start: local HEAD and `origin/codex/m00-01-workspace` both
  resolve to M00-01 commit `ea5c7c9dd0ad0a4018c1d3c6323790d383f20468`;
  no tracked/staged implementation changes remained. Existing unrelated
  untracked Delivery2 material and ZIP are preserved/accounted for.
- State: Verified locally on 2026-10-31; documentation checks and policy review
  passed. Git delivery and remote CI are reported separately after this commit.
- Outputs: root `docs/testing/TEST-MILESTONES.md`, `TASK-TEST-MATRIX.md`,
  `QA-EXECUTION-RULES.md`; minimal navigation/Git-policy reconciliation in root
  AGENTS and the existing Delivery2 addendum, strategy, roadmap and task index.
- Source review: 27 tasks M00–M04 and 26 tasks M05–M09, restricted to dependencies,
  permissible surfaces, acceptance and testing sections. Two read-only reviewers
  assisted; one integrator writes files. No application code/PRD bulk loading.
- Coverage verified: 53/53 distinct actual IDs; all 56 internal dependency edges
  match the index, manifest and Step sections and are acyclic. Bootstrap remains
  M00-01's external prerequisite despite manifest `[]`. All 111 source-document
  references exist locally. Fourteen milestone gates, eight human checklists and
  IT-001 through IT-008 are mapped without marking future work complete.
- Documentation audit: a PowerShell here-string piped to
  `node --input-type=module` checked IDs/order/columns, prerequisites, gates,
  source existence, 146 local Markdown links and two anchors, final newlines,
  trailing whitespace and sensitive-content patterns; exit 0. The only initial
  email-pattern hit was the existing GitHub SSH remote, reviewed and excluded.
- `git diff --check` passed. Read-only comparison against the supplied ZIP found
  all 52 newly versioned Step sources unchanged; M00-01 is unchanged from HEAD.
  No application code, dependency/lockfile, schema, API or financial behavior
  changed. The staged audit covers 69 documentation paths and their versioned
  link targets. Its first cached-diff check found an extra blank line at the
  matrix EOF; that formatting issue was removed before the required rerun.
- Final policy review resolved the M00-05 ordering: local checks and workflow
  review precede commit/push; exact-SHA remote CI follows push and blocks
  milestone closure / dependent Steps until successful. AGENTS/addendum, matrix,
  strategy and roadmap use this same distinction. Late-task review also made
  weight-sum, zero-versus-unknown income and staging mock rejection explicit.
- The commit includes only the nine authored policy/status documents and their
  previously untracked direct source/link targets (52 unchanged Step files,
  manifest, QA request and six architecture/algorithm/test/decision sources).
  This preserves versioned Markdown navigation without importing the whole ZIP.
  Nine indirect Step source documents remain present locally but untracked;
  they require deliberate delivery before a clean clone can execute those Steps.
  Other pre-existing untracked package material is preserved and excluded.
- No repository workflow or active Git hook is configured at this baseline;
  no known automatic deployment trigger was found. External integration/webhook
  settings are not visible in this local inspection. No human product acceptance
  is claimed by this documentation verification.
- Local tests and Git delivery are separate from human/remote-CI approval.
  Future successfully verified Steps now have standing ordinary commit/push
  authorization. No automatic next Step, force-push, merge, PR, tag, release,
  deployment or cloud resources. Scope/release/security gates remain unchanged.
- Source limitations are recorded centrally: phased IT-001, incomplete opening
  fixture/withdrawal policy, proposed product coefficients/cap/risk thresholds,
  M07 import/export timing, M08 staging availability and M09 performance limits.
  Future owners resolve them before dependent implementation; no invented values.
- No implementation Step was rerun, completed or newly marked Verified. M00-01
  remains the last verified implementation; M00-02 onward remain unexecuted.
- No application test/build/lint command is required or run for this docs-only
  assignment. Validation is document links/anchors, 53-ID coverage/dependencies,
  status/policy consistency, source preservation, diff and staged-secret review.
- Delivery target: one separate documentation commit on
  `codex/m00-01-workspace`, then ordinary push to its authorized origin branch.
  Record actual commit SHA, push and remote CI results in the post-commit report.

## M00-01 delivery and evidence

- Branch: `codex/m00-01-workspace`, created from `022cae4`. The original
  implementation verification made no commit, push, deployment or cloud-resource
  change. The separately requested Git delivery is recorded below.
- Added root package/workspace manifests, `.node-version`, `tsconfig.base.json`,
  solution references, and six private ESM package skeletons under `apps/` and
  `packages/`. Source entries export no business behavior.
- Pinned Node 24.22.1, pnpm 11.25.0 and TypeScript 6.0.3. Supported Node engine:
  `>=24.22.1 <25`; exact Node pin is in `.node-version`. TypeScript is the only
  external project dependency. Internal dependencies use `workspace:*`.
- Core has no dependencies or ambient browser/Node globals. Only web/UI configs
  enable DOM libraries. API runtime types, React, Hono, Zod, Drizzle and app
  behavior remain for their later tasks. No contracts, schema or algorithms changed.
- Added `tests/M00-01.workspace.test.mjs` using Node's built-in test runner.
  TypeScript probes compile in memory; they do not modify production files.
- Updated README setup instructions, AGENTS navigation, root task navigation and
  Delivery2's M00-01 completion markers. No bulk document import or ZIP edits.
- Necessary support surfaces beyond the Step's indicative file list:
  `.node-version` for its required Node pin, `pnpm-lock.yaml` for its explicit
  lockfile criterion, `tests/` for its required focused/negative checks, and
  navigation/status files for the user's Delivery2 routing and completion record.
- At original implementation verification, only `pnpm-lock.yaml` was staged for
  tracking. The user-provided Delivery2 directory and ZIP were already untracked
  on entry and were not bulk-staged.

Validation ran in Windows native PowerShell, with the already-installed Node
24.22.1 runtime prepended to PATH for each command. pnpm 11.25.0 was already
available. The user's default Node 20.15.0/fnm configuration was not changed;
their own terminal must select the pinned version as described in README.

| Command / check | Result |
| --- | --- |
| `pnpm install --reporter=append-only` | Passed on Windows; installed TypeScript and linked all 7 projects including root |
| `pnpm install --frozen-lockfile --offline --reporter=append-only` | Passed; SHA-256 of lockfile unchanged |
| `pnpm typecheck` | Passed; composite compiler checks all six referenced packages |
| `pnpm build` | Passed; JS, declarations and build metadata emitted only under ignored package `dist/` folders |
| `pnpm exec tsc --build --clean` then `pnpm test` | Passed from cleared compiler output; test command builds its prerequisites; 7/7 tests passed, none skipped |
| `pnpm list -r --depth 0` | Passed; 7 projects and expected local workspace links |
| `git diff --check` | Passed for tracked edits; existing system LF/CRLF advisory persists |
| `git rev-parse HEAD` / `git remote -v` | Original commit and SSH origin preserved |

Tests cover workspace dependency resolution with matching project references,
valid platform-neutral code, strict null/implicit-any/unchecked-index rejection,
exact optional property rejection, core browser/Node global rejection, web DOM
availability, and an unresolved package import. `typecheck` and `build` both use
`tsc --build` and intentionally emit ignored artifacts needed by project references.

Initial registry access failed inside the sandbox with a DNS error; approved
network access succeeded. `pnpm list` initially could not open pnpm's external
store index under the sandbox; the approved retry passed. The first install
reported an obsolete `packageManagerStrictVersion` option; it was removed and
the frozen install completed without that warning. No failed checks were hidden.

Lint/format tooling, Vitest, integration/E2E and CI were NOT RUN because they are
not configured until M00-05 (and no application flow exists in this Step).
There are no remaining M00-01 blockers. M00-02 and QA-policy authoring are not
part of the separately requested Git delivery.

## M00-01 Git delivery verification (2026-10-30)

- User explicitly requested Git delivery only: verify existing M00-01 work,
  commit its related files and push the current branch. No implementation redo,
  M00-02 work or QA-policy authoring was performed.
- Local state: Verified. Branch and authorized push target:
  `codex/m00-01-workspace` -> `origin/codex/m00-01-workspace`.
- Current Windows environment: Node 24.22.1, npm 11.19.1, pnpm 11.25.0. These
  versions now resolve without per-command PATH changes after the separate
  environment task. Corrected README's fnm shell argument to `power-shell`.
- Re-ran `pnpm install --frozen-lockfile --offline --reporter=append-only`,
  `pnpm typecheck`, `pnpm build` and `pnpm test`: all passed; 7/7 tests passed,
  none skipped; lockfile SHA-256 unchanged.
- Commit scope: M00-01 configuration, six package skeletons, focused tests,
  associated navigation/status updates, its delivery task/index, addendum,
  START-HERE and the two referenced architecture documents. Remaining Delivery2
  specifications, the original ZIP and the QA prompt are separate local material
  and are not included in this task commit.
- Lint and integration/E2E checks remain unavailable until later tasks; no
  `.github/workflows` or other tracked auto-deployment pipeline was found.
  Local verification does not assert remote CI success or human UX acceptance.
- The same task commit carries this evidence. Its resulting SHA and actual push
  result are reported after committing; no self-referential commit SHA or
  unverified push success is recorded here. No merge, PR, tag or deployment.

## Repository baseline at bootstrap completion

- Actual path: `D:\myWORK\project\finpath` (Windows-backed; not relocated).
- Reused the existing repository; no clone or Git initialization was performed.
- Branch: `main`; upstream: `origin/main`.
- Origin fetch/push: `git@github.com:guangtian0330/personalFinance.git`.
- Existing HEAD: `4c385ace4677c320d0705e67603e61c5bf6df197` (`Initial commit`).
- Local `origin/HEAD` points to `origin/main`. This is the existing local remote
  reference, not a fresh network verification of GitHub's default branch.
- Before bootstrap: tracked `README.md` contained `# personalFinance`; the
  untracked `.ai/` directory held the master prompt and planning-review draft.
- Existing README heading preserved; `.ai/` files were outside bootstrap edits
  and were not staged during bootstrap.
- No new commit: the repository already has history, so the new-repository
  initial-commit condition does not apply. Further commits require authorization.
- Push: NO. No PR, deployment or remote mutation.

Subsequent user authorization: stage and commit all repository changes,
including the two `.ai/` planning documents, and push `main` to `origin`.
The baseline and verification results in this document describe the completed
bootstrap before that Git operation. Git history and remote refs record the
resulting commit and synchronization state.

## Bootstrap environment inspected (2026-10-27)

| Check | Observed result |
| --- | --- |
| Shell / path | PowerShell, `D:\myWORK\project\finpath` |
| `git --version` | `2.47.1.windows.2` |
| `node --version` | `v20.15.0` |
| `npm --version` | `10.7.0` |
| `codex --version` | `codex-cli 0.164.0-alpha.11.1` |
| Git identity | `user.name` and `user.email` are configured; no changes made |

Codex CLI returned its version but warned that stale temporary directories could
not be cleaned and PATH aliases could not be created because access was denied
under its user-profile temporary directory. This did not prevent document work.
No tools, packages, databases or global utilities were installed. The shell is
PowerShell rather than WSL; future dependency compatibility has not been tested.

System Git has `core.autocrlf=true`. Git emitted a warning that LF in README may
be replaced with CRLF on a future checkout. Current bootstrap text files were
verified to use UTF-8/LF and `.editorconfig` requests LF; no Git configuration was
changed. The warning did not cause `git diff --check` to fail.

## Bootstrap artifacts

- Extended `README.md`; added `AGENTS.md`, `.gitignore`, `.editorconfig`, this
  status file and `tasks/README.md`.
- Added empty `apps/web/`, `apps/api/`, `packages/core/`, `packages/contracts/`,
  `packages/persistence/`, `packages/ui/`, `docs/requirements/`,
  `docs/architecture/`, `docs/algorithms/`, `docs/decisions/` and `tests/`, each
  retained with `.gitkeep`.
- `tasks/` holds its index; `docs/` holds this status file. No approved product,
  architecture, algorithm or executable Step specification was created.

## Bootstrap verification (2026-10-27)

| Command / check | Verified result |
| --- | --- |
| `git rev-parse --show-toplevel` | Expected Windows-backed project root |
| `git remote -v` | Expected SSH origin for fetch and push |
| `git status --short --branch --untracked-files=all` | On `main`; README modified; only bootstrap additions and the two pre-existing `.ai/` files untracked |
| `git branch -avv` and `git symbolic-ref --short refs/remotes/origin/HEAD` | `main` tracks `origin/main`; cached remote HEAD is `origin/main` |
| `git log -5 --format=oneline` | Existing initial commit only |
| `git diff --check` | Passed, exit 0; LF/CRLF advisory described above |
| `git diff -- README.md` and new-file content inspection | Original heading retained; documentation/configuration only; no real financial data or credentials in bootstrap changes |
| `git diff --cached --name-only` | Empty; nothing staged |
| `Get-ChildItem -Path apps,packages,docs,tasks,tests -File -Recurse -Force` | Expected skeleton: 11 `.gitkeep` files plus project status and task index |
| PowerShell strict UTF-8/whitespace checks | All 6 document/config files use UTF-8, LF, final newline and no trailing whitespace |
| PowerShell placeholder/link/count checks | All 11 placeholders empty; local Markdown links resolve; candidate Step counts total 53 |
| `git check-ignore --quiet --no-index -- <path>` with individual path arguments | 18 sensitive/generated path cases ignored; 7 example/source/lock/prompt cases remain visible |

Ignore checks included nested environment files and the exact `.env.example`
exception, local D1/SQLite data, user imports/exports/backups, credentials, keys,
dependency/test output, SQL migration source, synthetic CSV fixtures and package
manifests/locks. No probe files were written. File names and contents were
reviewed; the pre-existing `.ai/` documents were neither edited nor staged.

No application tests, lint, type checks or builds were run: bootstrap
intentionally creates no package manifest, source code or CI files. No runtime
behavior, API contracts, database migrations or financial algorithms changed.

## Bootstrap follow-up (historical)

Bootstrap originally stopped pending formal documents and M00-01 authorization.
The user supplied Delivery2 and explicitly requested M00-01 on 2026-10-30; its
outcome and the next authorization gate are recorded at the top of this file.
