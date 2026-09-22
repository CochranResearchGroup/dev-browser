# Plan 0005: Upgrade pinned policy and embedded browser skill

State: CLOSED
Owner: primary agent
Branch: chore/browser-skill-hygiene
Issue: #5
PR: #6

## Current State

Plan 0004 refreshed the skill files but the installed v0.2.9 CLI still embeds
the older skill. The selector bundle is pinned to v0.1.22. User requests both
remaining updates under the repository policy. Reuse the existing worktree.

## Scope

Review v0.1.26 against the retained modules, merge applicable changes without
losing local contracts, rebuild/install v0.2.9 with the current embedded skill,
and publish through PR #6. Use serial tools and the primary agent.

## Non-goals

No v1 migration, browser upgrade, daemon restart, session cleanup, unrelated
policy expansion, model calibration, or service-skill replacement.

## Acceptance Criteria

- One active file and AGENTS link per adopted policy identity; audits pass.
- Current installed CLI and all skill targets agree on the canonical skill.
- Installed daemon payload and browser configuration remain unchanged.
- Source changes and installation evidence are committed and published.
- CI and required maintainer review gate integration; no self-approved merge.

## Definition of Done

Record exact source pins, test results, installation hashes, and remaining
review/integration state. Close the implementation plan after publication;
keep the issue open until integration is verified.

## Outcome

Policy bundle v0.1.26 is installed and 17 active policies are uniquely wired;
full/active planning audits and 22 planning-auditor tests pass. TypeScript and
12 Rust tests pass; the v0.2.9 release CLI is installed with the current skill.
Installer round-trip and unchanged daemon/config hashes are recorded in
../evidence/embedded-skill-upgrade.json. Local browser tests passed 173 assertions
but two teardown hooks timed out; test processes exited and their absence was
verified. CI and maintainer review remain PR #6 integration gates. Graphiti
feedback mirroring timed out and is not claimed persisted. See dated note 0002.
