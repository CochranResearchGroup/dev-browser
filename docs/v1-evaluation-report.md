# v1.0.0-rc.3 WSL evaluation

## Decision

The candidate builds and supports useful browser automation with stealth
Chromium 150, but is **not ready to replace the installed v0.2.9 fork**.
WSL crash recovery, immediate restart reliability, and fork-specific browser
selection/discovery behavior remain migration gates. Chromium 153 also fails
headless interaction checks in v1; switching from Playwright to Puppeteer did
not resolve that issue.

This is a build and evaluation, not a runtime migration. Production/runtime
source is unchanged from upstream `a25e7672e199153b2f5b52a841a62436a28d925f`.
The evaluation branch adds a repeatable acceptance harness and evidence.

## Advantages demonstrated

The compiled candidate supports concurrent scripts, cross-origin iframe refs,
Puppeteer page APIs, and MCP text/image responses with Chromium 150. A single
Bun-compiled executable also replaces the split Rust/Node build. These are
useful reasons to continue a v1 migration branch once the gates below are fixed.
This run does not establish that v1 is faster than the installed fork: no
controlled v0.2.9 benchmark was performed.

## Built artifact

- Worktree: `/home/ecochran76/workspace.local/dev-browser-v1-eval`.
- Branch: `eval/v1-rc3`.
- Binary: `dist/dev-browser`, version `1.0.0-rc.3`, approximately 92 MiB.
- SHA-256: `6ee36900b401afc127612badd0517cd3e7e4e158fa58ad65f7e0fbc6d0b55a3b`.
- Toolchain: Bun 1.3.14 (upstream CI version), Puppeteer 25.8.0,
  TypeScript 5.9.2, Linux/WSL.
- Frozen dependency install, TypeScript check, daemon bundle, compiled CLI,
  version/help checks, and npm pack dry-run all passed. No release binary was
  downloaded during postinstall, and no package was published or globally installed.

## Results

| Check | Result |
| --- | --- |
| Full upstream suite, stealth Chromium 150.0.7835.0 | 335 pass, 8 fail, 1 error; 343 tests, 28 files |
| Compiled acceptance, stealth Chromium 150 | 10 pass, 1 fail |
| Compiled acceptance, stealth Chromium 153.0.8003.0 | 5 pass, 6 fail |
| Stock Google Chrome 151.0.7922.108 lifecycle control | 28 pass, 5 fail; reproduces WSL recovery failures |
| Full upstream suite, stealth Chromium 153 | 294 pass, 49 fail, 9 errors; 343 tests, 28 files |
| Compiled benchmark, stealth Chromium 150 | 6 of 8 targets met, 2 missed |

Counts, browser identities, and individual acceptance results are in
[summary.json](evaluation/v1-rc3/summary.json),
[compiled-stealth150.json](evaluation/v1-rc3/compiled-stealth150.json), and
[compiled-stealth153.json](evaluation/v1-rc3/compiled-stealth153.json).

The 150 compiled checks passed headed (Xvfb) and headless navigation, form fill,
normal Puppeteer locator click, snapshots, screenshots, `navigator.webdriver`
false, exact executable identity, named-page persistence, cross-origin iframe
refs, four simultaneous scripts on independent pages, explicit CDP attachment
and external-browser survival, request timeout/recovery, and MCP text/image
responses. The one failed check was immediate stop/start. The final cleanup
check passed for both compiled acceptance runs.

## Findings and migration gates

### WSL orphan recovery: confirmed independently of stealth Chromium

The upstream SIGKILL recovery test leaves a browser whose parent is WSL
`Relay(51942)` PID 51939, rather than init/PID 1. In
`src/daemon/browsers.ts`, `classifyLockHolder` treats a live parent other than
itself as foreign ownership. The successor daemon therefore refuses the
profile with `ProfileBusyError`. The failure contaminates four later lifecycle
checks that reuse that profile. Stock Chrome reproduces the same five failures.

The failed cases are SIGKILL recovery, subsequent concurrent cold start,
finite/infinite busy-loop handling, and version-mismatch recovery. This does
not establish five independent defects: the later cases see the same blocked
profile. A fix needs trustworthy browser-owner provenance across WSL adoption;
blindly treating every child of a WSL relay as safe to kill is not acceptable.

Evidence: [full 150 suite](evaluation/v1-rc3/tests-stealth150.txt) and
[stock lifecycle control](evaluation/v1-rc3/lifecycle-stock151.txt).

### Immediate stop/start: observed compiled-binary failure

The 150 acceptance harness failed one of three rapid stop/start cycles with
`TargetCloseError: Protocol error (Target.setDiscoverTargets): Target closed`.
The 153 run passed this check. This is an observed intermittent failure; the
root cause has not been proved. The benchmark, which waits 300 ms between stop
and launch, completed its cold-start samples. Migration should require an
independent repeated restart test after the shutdown/profile-ownership path is
reviewed.

### Chromium 153: headless compatibility remains a blocker

The compiled candidate's normal headless locator click timed out. Subsequent
page-state validation, cross-origin iframe action, concurrent actions, explicit
CDP action, and MCP action also failed. These are partly dependent checks;
the named-page mismatch follows the failed click. Headed mode under Xvfb
passed the same core interaction and browser-identity check.

Both candidate paths are pinned promoted Linux artifacts, without changing
any shared Chromium alias. This evaluation does not certify stealth behavior
beyond the observed `navigator.webdriver === false`, nor website-specific
compatibility.

### Packaging tests: host permissions and missing download deadlines

The host's umask is `0077`. `scripts/download-binary.cjs` supplies mode `0755`
to `writeFileSync`, so the resulting test file is `0700`; the upstream test
requires exact `0755`. The executable still runs for its owner. This is a
packaging-contract/test failure, not a browser execution failure.

Two unreachable-mirror tests use `127.0.0.1:1`. On this host that endpoint does
not immediately refuse a connection; both exceeded the 120-second test budget,
and the suite also reported a teardown error. A separate bounded Node probe
confirmed no response/error within two seconds. The downloader has no request
timeout, so unavailable mirrors can leave installation waiting. Raw failures
are retained rather than hidden by changing umask, dropping tests, or altering
runtime source.

### Fork migration work remains

| Current fork capability | v1 situation |
| --- | --- |
| Native Linux stealth executable | Supported through `DEV_BROWSER_CHROME` or config `chrome`; tested with both artifacts |
| Invalid configured executable produces an error | Upstream skips nonexistent candidates and can fall back to another browser; requires a deliberate migration decision |
| WSL Windows-profile `DevToolsActivePort` discovery | Not present in v1's auto-connect path |
| Authenticated agent-browser daemon discovery | Not present in v1's auto-connect path |
| Custom `--port` / `--profile-path` launch discovery hints | Explicit `--connect PORT`/URL covers ports; custom profile discovery needs porting |
| Codex skill install | Present upstream; machine-specific skill guidance still needs review |
| Existing Playwright scripts / snapshot helpers / CUA APIs | Puppeteer/API conversion needed; `cua` and `domCua` wrappers are removed |
| QuickJS security isolation | Removed; v1's VM is not a security boundary |

Source inspection: `src/shared/chrome.ts`, `src/shared/config.ts`,
`src/daemon/sources/cdp.ts`, and upstream `CHANGELOG.md` and design decisions.

## Measured performance

Fifteen samples per regular item, three for cold start, using the compiled
binary and stealth Chromium 150. Original targets were retained (scale 1).
The Chromium 153 suite was running concurrently, so these are host observations,
not controlled comparative claims against v0.2.9.

| Operation | Median | Upstream target |
| --- | --- | --- |
| `1+1` end-to-end | 26.8 ms | 25 ms, missed |
| Get page and title | 29.5 ms | 40 ms |
| Evaluate | 25.9 ms | 40 ms |
| Small snapshot | 6.53 ms | 30 ms |
| Large snapshot | 60.6 ms | 150 ms |
| Viewport screenshot | 40.7 ms | 120 ms |
| Additional per-call overhead | 0.23 ms | 0.10 ms, missed |
| Cold start | 934 ms | 1500 ms |

Evidence: [benchmark output](evaluation/v1-rc3/benchmark-stealth150.txt).

## Reproduction

All commands run from the evaluation worktree. `CHROME_PATH` below denotes an
explicit promoted Linux executable, not the shared Windows `current` alias.

```sh
DEV_BROWSER_SKIP_DOWNLOAD=1 npm exec --yes --package=bun@1.3.14 -- bun install --frozen-lockfile
npm exec --yes --package=bun@1.3.14 -- bun x tsc --noEmit
npm exec --yes --package=bun@1.3.14 -- bun run build
DEV_BROWSER_CHROME="$CHROME_PATH" npm exec --yes --package=bun@1.3.14 -- bun run test
xvfb-run -a npm exec --yes --package=bun@1.3.14 -- bun scripts/evaluate-compiled.ts "$CHROME_PATH" tmp/acceptance.json
DEV_BROWSER_CHROME="$CHROME_PATH" npm exec --yes --package=bun@1.3.14 -- bun run bench/run.ts --check --bin dist/dev-browser --runs 15
npm pack --dry-run --json --ignore-scripts
```

The test helpers and acceptance harness create temporary `DEV_BROWSER_HOME`
directories. They do not target `~/.dev-browser/v1` or the installed v0.2.9 state.

## Closeout

Evaluation completed with the failures above retained. The full 153 suite took
1100.92 seconds; its raw results are in [tests-stealth153.txt](evaluation/v1-rc3/tests-stealth153.txt).

Fresh OS census found no remaining evaluation processes after removing 36
leftovers from the earlier suites and eight crash handlers from the 153 suite.
The compiled acceptance runs had already stopped their owned daemons.
Cleanup receipts and the final census are retained in the evidence directory.

The installed v0.2.9 binary SHA-256 remains
`8ec4899b452e741c1dc848c05a4c848110370999004ef7fe51549a8e1498a56c`.
Daemon PID 77326 remains live with zero browsers, and config still selects the
same native Linux stealth Chromium 150 artifact. The main worktree is still
at `6a6f9d6`, with its pre-existing untracked `.codex` preserved.
See [installed-runtime-closeout.json](evaluation/v1-rc3/installed-runtime-closeout.json).

The candidate remains an isolated evaluation build. Keep the installed fork
as the default; address the WSL recovery and restart failures and port the
required fork behavior before a migration acceptance run.
