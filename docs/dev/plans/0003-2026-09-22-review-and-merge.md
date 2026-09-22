# Plan 0003: Review and merge fork maintenance and policies

State: CLOSED

## Current State

Operator requested review/merge of PRs #3 and #4. Review identified six Windows
fixture failures at the original maintenance head. Commit d26ad5c replaces
host-specific path assumptions and uses the existing native Windows TCP
transport in the agent-browser test. TypeScript and all 41 discovery tests
pass locally. The policy branch CI passed Linux/Windows daemon and Rust checks,
formatting, bundling, and policy audit at e12d24f. This closeout becomes
effective on integration through PR #4 after PR #3; current GitHub checks and
merge ancestry remain the authority, not this prospective closure commit.

## Scope

Owner: primary agent. Review fork carry and policy changes, fix accepted CI
blockers, validate exact heads, merge #3 then #4, and reconcile local main.
Write surfaces: discovery tests and review/custody docs. Serial critical path:
review, focused fix, CI, ordered merge, ancestry and issue readback.
Target: origin/main via merge commits. Operator's explicit review/merge request
is the authority for this manual merge; no independent GitHub approval is claimed.

## Non-goals

No v1 migration, runtime reinstall, Graphiti repair, history rewrite, branch
protection bypass, or worktree deletion. No broad unrelated refactoring.

## Acceptance Criteria

- Accepted Windows CI findings are fixed, with native CI proving behavior.
- Applicable checks pass on each current PR head; failures remain visible.
- Both PRs merge in order and target ancestry contains both exact heads.
- Local main fast-forwards and issues/custody reflect integrated outcomes.

## Review findings

Blocking: six failures in auto-connect.test.ts on Windows (PR #3 CI run
35739438821, also reproduced in #4). Fixtures compared POSIX literals with
native paths; custom profile fixtures omitted path resolution; Unix socket
setup failed on Windows. Fixed without runtime changes or skipped tests.
Validation: tsc --noEmit and focused Vitest (41/41) on Linux; Windows CI passed in PR #4 run 35740904433.

No additional blocking findings in reviewed fork configuration, protocol
plumbing, permissions, policy wiring, or PR dependency arrangement. Existing
native Windows live-browser acceptance remains outside these fixture checks.

## Definition of Done

Applicable CI, GitHub merged state, ancestry, local status, and issue state are
verified. Installed runtime and completed v1 evaluation remain separate.
