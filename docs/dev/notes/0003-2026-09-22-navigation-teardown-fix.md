# Navigation teardown diagnosis and repair

Plan 0006; issue #5; PR #6. Base: af26d57d671d9f4246befa000ae1df920cef1bf0.

## Proven cause and scope

Both navigation fixtures awaited `server.close()` before stopping their browser.
The instrumented reproduction reached `sandbox done; HTTP close begin` in both
suites, then timed out. In CUA, HTTP close completed only after the enclosing
suite's fallback browser shutdown. This is an HTTP test-fixture shutdown
ordering problem, not evidence that the installed browser daemon cannot stop.

The existing 180-second failure is preserved in local-vitest-upgrade.json.
Temporary diagnostics reduced only the two hook limits to 10 seconds and
selected navigation tests: five assertions passed, both teardown hooks failed,
27 unrelated tests were excluded by the explicit name filter, duration 27.11s.
Instrumentation and diagnostic limits were removed before the final patch.

A shared test-only `closeTestHttpServer` starts server close, then calls
`closeAllConnections` so exclusively owned preconnected and unfinished HTTP
connections cannot hold shutdown open. It still awaits the close callback and
propagates errors. Both navigation fixtures use it. No production browser,
daemon, sandbox implementation, timeout, or installed binary changed.

## Regression and acceptance

A socket-level regression covers clients that connect without sending a request
and clients with unfinished requests. Both fail with the original graceful-only
close (`HTTP teardown did not settle` at one second), and both pass after the
fix. Client sockets and the server are released in finally even on failure.
An initial regression-fixture connect-listener ordering bug was corrected before
this before/after comparison; it was not a product failure.

- Socket/cleanup tests: 5 passed, 0.305s (2 new regression cases).
- Complete affected suites: 32 passed, 17.83s with configured Chromium 150.
- Full local suite: 21 suites, 175 tests passed, 26.95s (27.63s monitored wall).
- TypeScript, changed-file formatting, and Cargo build passed.
- Full run sampled aggregate descendant RSS peaked at 4,546,093,056 bytes with
  two workers, below the 8 GiB target. PID/start-time census found no surviving
  owned live processes. Daemon PID 77326 and config/payload hashes stayed equal.
- The first monitor's cmdline delimiter prevented profile collection; it does
  not support a profile-level claim. That limitation is preserved in the full
  receipt; a corrected focused monitor supplies the separate profile census.
  The focused run passed 32 tests in 18.16s monitored wall; a final scan across
  all affected temporary profile prefixes found zero browser processes.

Receipts: ../evidence/navigation-teardown-validation.json and
../evidence/navigation-teardown-profile-census.json. Original failures remain
historical evidence; this is a verified code repair, not a pass-on-retry claim.
No test skips or enlarged timeouts are retained. No daemon restart or Chromium
configuration change was needed. CI and maintainer review remain integration
checks for the new PR head.
