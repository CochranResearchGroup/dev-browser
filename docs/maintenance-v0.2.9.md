# v0.2.9 fork maintenance merge

Date: 2026-09-21

## Scope and plan

Merge upstream tag `v0.2.9` (`edd6f44`) into fork `main` at `e3a7174`,
preserving published ancestry. Upstream `main` at `a25e767` contains the
incompatible 1.0 rewrite and is outside this maintenance merge.

1. Merge the release tag without rebasing the four published fork commits.
2. Resolve overlaps while retaining WSL and agent-browser discovery, custom
   CDP port/profile flags, Codex skill installation, and Unix permissions.
3. Rebuild both embedded bundles, run daemon and Rust checks, and inspect the
   resulting fork delta against the release tag.
4. Commit the verified merge locally. Publication and installed-runtime
   replacement are separate operations.

## Resolution decisions

- Keep upstream request execution and idle reaping. Pass custom discovery
  hints together with its deadline and cancellation signal.
- Keep upstream atomic endpoint binding. Apply the fork's socket and PID
  permissions after binding, without restoring the old unconditional unlink.
- Keep the local skill guidance and add upstream idle-cleanup documentation.
  Use upstream's current Codex installer guidance instead of the obsolete
  clone-and-copy README section.
- Retain the installer step that regenerates the sandbox-client bundle.
- Upstream already includes Codex installer support; its updated Rust tests
  cover the shared behavior.

## Validation results

- `daemon`: frozen pnpm install, `npx tsc --noEmit`, both bundle commands,
  and `pnpm format:check` passed.
- `daemon`: `pnpm vitest run` passed, 21 files and 161 tests. This includes
  existing WSL, custom-port, agent-browser, idle-reaper, sandbox, CUA, and
  request-execution coverage. Two added regression tests cover cancellation
  during custom-port probing and deadline/cancellation with custom profiles.
- `cli`: `cargo fmt -- --check`, `cargo build`, and `cargo test` passed;
  all 12 Rust tests passed.
- Built CLI help includes custom port/profile flags, idle timeout, and CUA APIs.
- `git diff --check` passed. Native Windows execution and attachment to a
  real Windows Chrome session were not exercised; WSL discovery uses fixtures.

The pre-existing untracked `.codex` entry is excluded from the merge.
