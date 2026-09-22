# Workstream custody at policy adoption

Snapshot: 2026-09-22. Refresh Git refs and worktree status before relying on this.

| Branch | Role | Evidence | Custody / disposition |
| --- | --- | --- | --- |
| main | v0.2.x maintenance | 6a6f9d6 before adoption; docs/maintenance-v0.2.9.md and docs/wsl-browser-default.md | Contains unpublished local maintenance; preserve and reconcile before remote publication |
| eval/v1-rc3 | Completed v1 evaluation | d86af0c; branch-local docs/v1-evaluation-report.md | Local retained worktree; not integration-ready, not approved for cleanup or migration |
| chore/repo-policy-adoption | Policy bootstrap | Plan 0001 | Local topic, then local fast-forward; retain worktree until remote custody is established |

The v1 evaluation is closed research, not an active implementation lane. Defer
the shared active-lane-coordination catalog until concurrent implementation
lanes are opened; adopt it before such parallel execution. This inventory does
not claim the library's machine-audited catalog contract. No roadmap/runbook
is needed for this bounded CLI adoption. New substantive plans live in
`docs/dev/plans/`; dated feedback lives in `docs/dev/notes/`.
