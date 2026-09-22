# Plan 0006: Resolve local navigation teardown timeouts

State: CLOSED
Owner: primary agent
Branch: chore/browser-skill-hygiene
Issue: #5
PR: #6

## Current State

The prior local full suite passed 173 assertions but two navigation afterAll
hooks timed out at 180 seconds. The exact stalled operation is unknown. CI
passed with a different browser environment; that does not resolve this failure.

## Scope

Serial critical path: instrument the two cleanup hooks, reproduce with configured
Chromium 150 in isolated test profiles, repair the proven cause, validate focused
and full tests, and publish evidence in PR #6. Reuse the clean existing worktree.
Primary agent owns diagnosis and integration. No delegated work.

## Non-goals

No v1 migration, Chromium/config upgrade, shared browser termination, timeout
inflation, skipped tests, or unrelated cleanup. No automatic merge without review.

## Acceptance Criteria

- Identify the stalled cleanup step with direct evidence.
- A regression check detects the old behavior and passes with the fix.
- Both affected suites and full daemon validation pass on configured Chromium 150.
- No test-owned browser/worker processes survive; existing daemon/config unchanged.
- Publish exact head and CI evidence, retaining the original failed run.

## Definition of Done

Commit and push the bounded fix and evidence; reconcile PR/issue status. Focused
checks target two minutes (diagnostic timeout reproduction may use the existing
180-second hook bound once); full checks budget 15 minutes, one suite at a time,
at most four workers. Measure observed duration and record any breach.

Graphiti assessment: skip, because current failing logs and exact source are
sufficient; prior policy mirror timeouts do not block diagnosis. Routing uses
primary inherited model and deterministic tools; no calibration work.

## Outcome

Diagnosed HTTP fixture close waiting for connections while browser shutdown was
queued behind it. Added test-only forced connection cleanup after stopping the
listener; both socket regressions detect old behavior and pass with the repair.
Affected suites pass (32); full suite passes (175/21 suites), TypeScript,
formatting, Cargo build, and policy audits pass. Full monitored wall time 27.63s,
peak sampled aggregate RSS 4.55 GB. Fresh PID/start-time and affected profile
prefix checks show no test leftovers; daemon/config/payload unchanged. See note
0003 and navigation-teardown evidence receipts. Publish through existing PR #6;
CI/review remain integration gates. No production installation needed.
