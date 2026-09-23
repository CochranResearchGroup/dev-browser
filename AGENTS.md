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

## Policy Loading Contract

- `AGENTS.md` is a routing surface, not a one-time pointer.
- Re-read the relevant policy files under `docs/dev/policies/` at the start of any non-trivial turn.
- Re-read the relevant policy files when task scope changes mid-session.
- When behavior is ambiguous, prefer re-reading policy over improvising from stale assumptions.

## Browser runtime operations

Before launching/attaching browsers or handing off browser work, read
[the maintained dev-browser skill](skills/dev-browser/SKILL.md). Agents choose
the appropriate existing runtime/profile and own tab, browser, daemon, and
resource cleanup. v1 remains explicit opt-in until an approved migration.

## Policy Re-read Triggers

- re-read planning-related policy before opening, revising, or closing a substantive plan
- re-read documentation-related policy before changing docs, contracts, or canonical authorities
- re-read validation and closeout policy before claiming work complete
- re-read branch, commit, and integration policy before starting a multi-file or multi-step implementation slice

## Policy Entry

This repo keeps its durable repo-local policy under `docs/dev/policies/`.

Read and follow:
- `docs/dev/policies/0001-policy-management.md`
- `docs/dev/policies/0002-policy-upgrade-management.md`
- `docs/dev/policies/0003-policy-adoption-feedback-loop.md`
- `docs/dev/policies/0004-graph-backed-memory-usage.md`
- `docs/dev/policies/0005-planning-discipline.md`
- `docs/dev/policies/0006-codegraph-usage.md`
- `docs/dev/policies/0007-code-testing-discipline.md`
- `docs/dev/policies/0008-git-worktree-hygiene.md`
- `docs/dev/policies/0009-commit-history-discipline.md`
- `docs/dev/policies/0010-branch-and-integration-strategy.md`
- `docs/dev/policies/0011-commit-and-push-cadence.md`
- `docs/dev/policies/0012-versioning-and-release.md`
- `docs/dev/policies/0013-turn-closeout.md`
- `docs/dev/policies/0014-validation-and-handoff.md`
- `docs/dev/policies/0015-upstream-fork-maintenance.md`
- `docs/dev/policies/0016-pull-request-and-issue-management.md`
- `docs/dev/policies/0017-model-selection-and-calibration.md`
- `docs/dev/policies/0018-notes-and-memories.md`
- `docs/dev/policies/0019-parallel-plan-design.md`
- `docs/dev/policies/0021-work-item-traceability.md`
- `docs/dev/policies/0022-architecture-guardrails.md`
- `docs/dev/policies/0023-documentation-change-control.md`
- `docs/dev/policies/0024-active-lane-coordination.md`
- `docs/dev/policies/0025-subagent-workflow-optimization.md`
- `docs/dev/policies/0026-collaborative-development-workflow.md`

## Scope

- `AGENTS.md` includes repo-local guidance plus the policy entry section.
- The durable policy body lives under `docs/dev/policies/`.
- Keep repo-specific commands, environment details, and operational caveats in this file or adjacent local docs.
