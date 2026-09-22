# Policy adoption and feedback — 2026-09-22

## Decision and provenance

Adopt `standalone-library` plus `validation-and-handoff`,
`upstream-fork-maintenance`, and local `pull-request-and-issue-management`.
The active set is the 16 uniquely linked files in AGENTS.md. The selector bundle
is v0.1.22, source `12a7f9fef466522e99be44d980c44a4ff056f540`, installed from the
reviewed local bundle under `.agents/skills/repo-policy-selector/` with its
manifest. `.agents/policy-selector-install.json` preserves installation provenance;
absolute paths there describe the installation event, not portable commands.

The library is installed source material. `docs/dev/policies/` is the runtime
policy authority. No live GitHub settings, issues, or PRs were changed.

## Extraction and migration disposition

- **Keep:** existing Node/pnpm/Cargo tooling, bundle-before-Cargo order, and
  runtime validation commands in AGENTS.md.
- **Merge:** validation, graph-discovery, Git, and closeout expectations into
  uniquely wired policy modules with local overrides.
- **Keep as historical evidence:** docs/maintenance-v0.2.9.md,
  docs/wsl-browser-default.md, and docs/validation/wsl-stealth-browser-smoke.json.
  These are completed receipts, not competing active plans.
- **Keep on its branch:** eval/v1-rc3's completed evaluation plan/report and
  artifacts at d86af0c. Do not move or reopen that work under adoption.
- **Retire:** none. No active legacy plan migration is needed; new bounded
  work uses docs/dev/plans and dated feedback uses docs/dev/notes.

## Fit, overrides, and deferred modules

Graphiti default is `use`, with per-task `use`/`skip`/`unavailable` decisions.
The initial repo-native selector could not see the operator-supplied Graphiti
instructions and returned task-conditional. The adopted explicit group
`dev_browser_main` corrects that; health and a bounded empty fact search were
verified. Adoption feedback is mirrored only through the verified policy 0004
workflow, not arbitrary memory writes.

The existing untracked `.codex` is a file. Installing into `.agents/` preserves
it; the install record was also moved out of the default `.codex/` location.
The upstream fork module was explicitly retained because selection inside a
linked worktree omitted it even though the main checkout detected it.

Prefer merge-based maintenance, not the generic private-fork rebase suggestion.
Preserve the operator's ask-before-missing-index initialization rule. PR/issue
management has no dedicated module in this bundle, so policy 0016 and GitHub
templates are a local extension, a candidate for future upstream harvesting.
No upstream message is authorized by this adoption.

Defer roadmap/runbook, goal-execution, subagent, and active-lane modules: this
is a bounded CLI policy adoption and the v1 evaluation is already complete.
Before new concurrent implementation lanes, adopt active-lane coordination.
The post-adoption heuristic recommends a broader product profile after reading
shared module text. That is selection feedback, not authority to expand the
retained profile. No active-lane or goal-only audit is claimed applicable.

## Validation and enactment

Run `python3 scripts/check-repo-policy.py` for full and active planning audits,
unique wiring, selector validation, and Graphiti routing. The GitHub policy
workflow runs the same command once published. Existing CI runtime checks remain.
Policy-only changes do not require rebuilding or running browser suites.

This adoption exercises discovery, worktree isolation, a bounded plan, and
policy validation. GitHub issue/PR review, enforced branch protection, remote
publication, and runtime release behavior are **not yet evidenced**.
The bootstrap exception permits only a validated local fast-forward of this
policy commit. Retain the local adoption worktree pending remote custody.
Graphiti verification details are in `docs/dev/evidence/graphiti-adoption.json`.

Graphiti feedback job `14dee3bb-960b-43d6-a535-ceaaff616aa8` failed with
`TimeoutError`; post-failure exact episode lookup returned zero matches.
No successful persistence is claimed and no retry was attempted. The dated
file remains canonical; recheck job and exact metadata before a later retry.
This bounded external-service failure does not block local policy adoption.
Full/active planning audits, unique wiring, pinned bundle byte comparison,
YAML checks (PyYAML 6.0.2), and staged diff checks passed.
