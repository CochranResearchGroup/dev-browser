# Policy | Pull requests and issues

## Issues

Use `CochranResearchGroup/dev-browser` for fork work. Search existing issues
before creating one. Substantive bugs, features, upstream syncs, and migration
work need a linked issue or a durable local plan awaiting publication. Trivial
edits may explain their scope directly in the PR.

Record the problem, expected/current behavior, reproducible evidence, affected
version/platform/browser, acceptance criteria, non-goals, owner, and dependencies.
Use the supplied bug/task templates. States are triage, ready, in progress,
blocked, in review, and closed; use body fields when matching labels do not
exist. Do not invent applied labels or assigned owners. Plans own execution;
issues own shared backlog and priority. One workstream should have one issue
and one responsible owner; link related PRs and plans rather than duplicating
tracking. An evaluation finishing does not close the migration blocker it found.

Close completed issues after the accepted outcome is integrated and evidenced.
Close duplicates with their canonical issue, or record explicit cancellation.
Use `Refs #N` for partial progress and `Fixes #N` only when the PR fully satisfies
acceptance. Inspect upstream issues read-only for context; cross-repo comments,
issue creation, or PR submission require scope covering that communication.

## Pull requests

Use topic branches and worktrees; target the fork's `main`. Name the problem
and changed behavior in the title/body. Include issue/plan, exact base/head,
validation commands/results, compatibility risks, upstream relationship, and
installed-runtime impact. Separate unrelated work. Use draft status while
acceptance, custody, or review remains incomplete.

Before publication, fetch the fork, inspect the intended base and full diff,
and reconcile unexpected remote changes. A policy adoption is not blanket
permission to publish private/local work. When publication is authorized, push
an explicit branch/ref and verify the remote SHA before creating/updating a PR.
Record local-only status honestly when publication is outside task scope.

Before merge, require applicable CI to pass on the current head, resolved
blocking findings, an approving maintainer review, and explicit authority for
the merge. New commits invalidate checks/reviews for changed behavior. Never
claim GitHub protection is enforced merely because this document requires it.
Prefer a merge commit; use squash only with a source-head to target receipt.
Do not force-push shared branches or auto-merge on an agent's self-review.

After merge, verify target ancestry (or squash receipt), reconcile issue/plan
state, and only then consider cleanup. Preserve a verified remote or archive
checkpoint before removing a clean worktree; no forced removal. A closed PR
alone is not proof of integration. Installation and release publication remain
separate actions.
