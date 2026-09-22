# v1 release-candidate build and evaluation

## Scope

Evaluate upstream `v1.0.0-rc.3`, commit
`a25e7672e199153b2f5b52a841a62436a28d925f`, on this WSL Linux host.
Worktree: `/home/ecochran76/workspace.local/dev-browser-v1-eval`.
Branch: `eval/v1-rc3`. Toolchain: Bun 1.3.14, matching upstream CI.

The installed v0.2.9 CLI, daemon, and profiles stay in place. All v1 browser
tests use an explicit temporary `DEV_BROWSER_HOME`. No publication or default
runtime switch is included. The main fork's untracked `.codex` is preserved.

## Execution and acceptance evidence

1. Install the locked dependency graph, typecheck, compile the daemon and CLI,
   inspect version/help, and check the npm package contents without installing
   or publishing the package.
2. Execute the full upstream test suite with the currently selected stealth
   Chromium 150. Execute it with stealth Chromium 153 as well to distinguish
   v1 compatibility from the observed v0.2.9/Playwright click failure.
3. Exercise the compiled binary against local fixtures with both builds:
   navigation, normal locator click and fill, snapshots and refs, screenshots,
   browser identity and webdriver, persistent named pages, concurrent scripts,
   request deadlines, rapid stop/start, and cleanup. Exercise headed mode under
   Xvfb and the MCP interface.
4. Run the upstream compiled-binary benchmark and report actual measurements
   separately from advertised targets. Investigate test failures against a
   stock Chrome control where useful; preserve failures in the report.
5. Recheck the installed v0.2.9 identity and state. Census operating-system
   processes to establish that evaluation daemons/browsers were cleaned up.
6. Record commands, counts, failures, limitations, fork-feature migration gaps,
   and a recommendation in a final evaluation report. Commit the evaluation
   artifacts on the separate branch.

Completion means a built, identified v1 binary and executed evaluation with
source-backed results. Migration readiness requires passing the applicable
runtime checks; a completed evaluation can instead identify migration blockers.
