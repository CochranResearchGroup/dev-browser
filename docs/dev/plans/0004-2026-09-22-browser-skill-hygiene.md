# Plan 0004: Refresh browser skill and resource ownership

State: CLOSED

## Current State

Installed shared dev-browser skill lags the maintained fork skill and lacks
idle cleanup and ownership guidance. Current CLI confirms named profiles,
page lifecycle, daemon-wide idle policy, and global stop semantics.
Policy-selector is pinned at v0.1.22; GitHub latest is v0.1.26. Policy-library
upgrade is reported separately and is not part of this browser-skill correction.

## Scope

Owner: primary agent. Branch: chore/browser-skill-hygiene. Target: origin/main
through a PR. Update the canonical skill and AGENTS routing, sync installed
agent copies with backups, and verify byte identity and command guidance.
Serial work: inspect, adapt, sync, validate, commit/publish. No delegation.

## Non-goals

No runtime/binary/default-browser upgrade, live session termination, v1 promotion,
policy-library upgrade, unrelated service-skill replacement, or automatic merge.

## Acceptance Criteria

- Agents select task-appropriate installed runtime/profile without routine re-asking.
- Named browser versus tab semantics, resource budgets, and ownership are explicit.
- Cleanup covers success/failure/cancellation and includes OS-level verification.
- Shared/external browser ownership and daemon-wide idle/stop effects are preserved.
- Canonical and installed dev-browser skills match; original files are backed up.
- Policy checks and diff checks pass; publication status is explicit.

## Definition of Done

The updated local skill is active and source changes are reviewable. Record
sync receipt and PR; no browser execution test is required for prose-only changes.

## Outcome

Canonical skill and shared/Codex, Agents, and Claude copies now match; backups
and exact hashes are recorded in docs/dev/evidence/browser-skill-sync.json.
CLI help confirmed the documented options and tab APIs. The current embedded
install-skill payload remains older until the CLI is rebuilt; do not use it to
refresh these installed copies. Runtime/default browser/config were unchanged.
Policy and diff checks passed. Source publication is a review branch/PR, not
an automatic merge or v1 upgrade.
