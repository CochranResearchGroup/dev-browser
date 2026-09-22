# AGENTS.md

This repository ships `dev-browser`: a Rust CLI plus a Node.js daemon for browser automation with a QuickJS sandbox. Use this file as the repo-specific guide when making code changes.

## Tooling

- Use Node.js tooling for `daemon/` and Cargo for `cli/`. Do not use Bun.
- The daemon package uses `pnpm`.
- The repo root contains packaging glue (`bin/`, `scripts/`, `README.md`), but most runtime behavior lives in `cli/` and `daemon/`.

## Validation

Run these before finishing changes that touch runtime code:

```bash
cd daemon && npx tsc --noEmit
cd daemon && pnpm vitest run
cd cli && cargo build
```

If you change daemon runtime code that is embedded into the Rust binary, rebuild the bundles first:

```bash
cd daemon && pnpm bundle
cd daemon && pnpm bundle:sandbox-client
```

`cli/src/daemon.rs` embeds `daemon/dist/daemon.bundle.mjs` and `daemon/dist/sandbox-client.js` via `include_str!`, so `cargo build` only sees the latest daemon changes after those bundles are regenerated.

## Policy loading contract

Re-read relevant policies at the start of non-trivial work and when scope changes.
Local adaptations in these policies refine the shared library. The installed
library is source material, not an additional set of active instructions.

| When | Read |
| --- | --- |
| Installing or wiring policy | [0001-policy-management](docs/dev/policies/0001-policy-management.md) |
| Reviewing shared policy updates | [0002-policy-upgrade-management](docs/dev/policies/0002-policy-upgrade-management.md) |
| Closing adoption or recording policy friction | [0003-policy-adoption-feedback-loop](docs/dev/policies/0003-policy-adoption-feedback-loop.md) |
| Planning, debugging, prior-context lookup, or durable memory writes | [0004-graph-backed-memory-usage](docs/dev/policies/0004-graph-backed-memory-usage.md) |
| Opening, revising, or closing substantive work | [0005-planning-discipline](docs/dev/policies/0005-planning-discipline.md) |
| Structural code discovery, refactoring, or index maintenance | [0006-codegraph-usage](docs/dev/policies/0006-codegraph-usage.md) |
| Choosing tests, retrying failures, or changing test budgets | [0007-code-testing-discipline](docs/dev/policies/0007-code-testing-discipline.md) |
| Creating, moving, or removing worktrees | [0008-git-worktree-hygiene](docs/dev/policies/0008-git-worktree-hygiene.md) |
| Preparing commits or preserving checkpoints | [0009-commit-history-discipline](docs/dev/policies/0009-commit-history-discipline.md) |
| Choosing a branch, integration target, or merge method | [0010-branch-and-integration-strategy](docs/dev/policies/0010-branch-and-integration-strategy.md) |
| Publishing, handing off, or pausing a branch | [0011-commit-and-push-cadence](docs/dev/policies/0011-commit-and-push-cadence.md) |
| Versioning, tagging, or releasing | [0012-versioning-and-release](docs/dev/policies/0012-versioning-and-release.md) |
| Ending a substantive turn | [0013-turn-closeout](docs/dev/policies/0013-turn-closeout.md) |
| Validating, reviewing, or handing off work | [0014-validation-and-handoff](docs/dev/policies/0014-validation-and-handoff.md) |
| Fetching or integrating upstream changes | [0015-upstream-fork-maintenance](docs/dev/policies/0015-upstream-fork-maintenance.md) |
| Managing issues, opening/reviewing/merging PRs | [0016-pull-request-and-issue-management](docs/dev/policies/0016-pull-request-and-issue-management.md) |

Use `docs/dev/plans/` for bounded plans and `docs/dev/notes/` for dated feedback.
The adoption-time branch inventory is [workstreams](docs/dev/workstreams.md).
Graphiti routing and write authority are defined in policy 0004; the primary
group is `dev_browser_main`. Preserve operator-provided CodeGraph/SysRAG routing
and its missing-index approval rule as detailed in policy 0006.

Policy-only validation:

```sh
python3 .agents/skills/repo-policy-selector/scripts/audit_planning_contract.py --repo-root . --json
python3 .agents/skills/repo-policy-selector/scripts/audit_planning_contract.py --repo-root . --active-only --json
python3 .agents/skills/repo-policy-selector/scripts/select_policy.py --repo-root . --policy-root .agents/skills/repo-policy-selector/policy-library --json
```

## Browser runtime operations

Before launching/attaching browsers or handing off browser work, read
[the maintained dev-browser skill](skills/dev-browser/SKILL.md). Agents choose
the appropriate existing runtime/profile and own tab, browser, daemon, and
resource cleanup. v1 remains explicit opt-in until an approved migration.
