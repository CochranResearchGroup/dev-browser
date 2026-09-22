# Fork workstreams and custody

Reconciled: 2026-09-22. Refresh origin and inspect worktrees before acting.
Git refs and GitHub review state outrank this dated projection.

| Branch | Role | Published checkpoint / tracking | Disposition |
| --- | --- | --- | --- |
| main | Local v0.2.x maintenance plus bootstrap policy | Local 3d3b071, now tracks origin/main; origin/main remains e3a7174 | Local-ahead contents are preserved in review branches; do not push main around review or reset it |
| maintenance/v0.2.9-wsl | Maintenance integration | origin/maintenance/v0.2.9-wsl at 6a6f9d6; [issue #1](https://github.com/CochranResearchGroup/dev-browser/issues/1), [draft PR #3](https://github.com/CochranResearchGroup/dev-browser/pull/3) | Await CI and approving maintainer review before authorized merge |
| chore/repo-policy-adoption | Policy adoption and publication reconciliation | origin/chore/repo-policy-adoption; baseline 3d3b071 plus Plan 0002 receipt; [issue #2](https://github.com/CochranResearchGroup/dev-browser/issues/2), [draft PR #4](https://github.com/CochranResearchGroup/dev-browser/pull/4) | Depends on #3; both PRs target main, and #4's diff narrows after #3 merges |
| eval/v1-rc3 | Completed v1 evaluation | origin/eval/v1-rc3 at d86af0c; branch-local docs/v1-evaluation-report.md | Published custody verified; retained worktree, no migration or cleanup approval |

Issues are enabled on the organization fork. Existing .codex remains untouched.
No worktree/ref was deleted. Publication is not integration: after approved
merges, fetch and fast-forward local main only if ancestry allows it, then
reconcile issue/plan state and cleanup against actual target ancestry.

These are review/evaluation custody tracks, not simultaneous implementation
lanes. Adopt the shared active-lane-coordination catalog before opening new
concurrent implementation lanes; no machine-audited lane catalog is claimed
here. Plans live in docs/dev/plans and dated feedback in docs/dev/notes.
