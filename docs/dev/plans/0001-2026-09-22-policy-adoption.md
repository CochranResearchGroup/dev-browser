# Plan 0001: Fork policy adoption

State: CLOSED

## Current State

The selector bundle and all 16 active policies are complete and validated.
Graphiti read discovery passed; feedback ingestion timed out and is recorded
in docs/dev/evidence/graphiti-adoption.json without a persistence claim.
The adoption checkpoint is prepared for the explicit local fast-forward;
remote publication and worktree cleanup remain outside this plan.

## Scope

Adopt the standalone-library profile with fork maintenance, validation/handoff,
and a local PR/issue contract. Install a pinned selector, wire AGENTS.md,
provide GitHub templates, and preserve existing local work.

## Non-goals

No runtime changes, v1 integration, GitHub publication/protection changes,
issue creation, upstream messages, or branch/worktree deletion.

## Acceptance Criteria

- Relevant policies are uniquely wired with explicit read triggers.
- Graphiti group and verified write workflow are concrete.
- PR, issue, worktree, and upstream integration rules have local targets.
- Existing tooling and historical evidence remain intact.
- Full and active planning audits plus policy/template checks pass.
- The adoption commit is on local main; no remote publication is implied.

## Execution

Owner: current primary agent. Branch: chore/repo-policy-adoption.
Base: 6a6f9d6. Target: local main; method: fast-forward bootstrap adoption.
Write surfaces: AGENTS.md, .agents/, docs/dev/, GitHub templates, policy audit CI.
Inputs: installed catalog/modules and current repository evidence.
Serial critical path: inspect, install, adapt, audit, record, commit, integrate.
No delegated tracks; content and wiring share the same write surface.
Terminal condition: local adoption and evidence complete, or a concrete blocker.

## Definition of Done

All acceptance criteria have evidence, the plan is CLOSED, and closeout clearly
separates local integration from remote custody and runtime state.

## Outcome evidence

`docs/dev/evidence/policy-validation.json` records successful local checks.
`docs/dev/notes/0001-2026-09-22-policy-adoption.md` records fit, migration
classification, exceptions, and the Graphiti failure. Local Git ancestry at
closeout proves integration; GitHub enactment remains unverified.
