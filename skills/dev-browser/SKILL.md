---
name: dev-browser
description: "Use for browser-only tasks on this machine: navigating sites, clicking UI, filling forms, taking screenshots, scraping rendered pages, or testing web-app flows in a real browser. Trigger when the user explicitly wants website interaction or browser automation. Do not use for general shell automation, API-only work, or local file manipulation."
---

# Dev Browser

Use the locally installed `dev-browser` CLI on this machine for sandboxed browser automation.

## Local Setup

- Binary path: `/home/ecochran76/.cargo/bin/dev-browser`
- If `dev-browser` is not on PATH in the current shell, run `. "$HOME/.cargo/env"` first.
- The embedded runtime is already installed under `~/.dev-browser`.

## When To Use

Use this skill when the task requires a real browser, for example:

- Open a website and inspect or interact with it
- Click buttons, fill forms, and submit flows
- Capture screenshots
- Scrape content that depends on client-side rendering
- Test a web app manually through browser actions

Do not use this skill when:

- The task can be done with HTTP requests or an API
- The task is generic automation unrelated to a browser
- The user is asking for local filesystem or terminal work

## Runtime selection and ownership

Agents are responsible for choosing the runtime and managing its resource use.
Make that choice from the task, required login/session, runtime health, and
available memory. Do not ask the user to choose routine implementation details.

| Task need | Runtime/profile choice |
| --- | --- |
| Isolated browser work without an existing login session | Installed v0.2.x dev-browser, QuickJS/Playwright; one task-owned named browser, headless by default |
| Visible interaction or debugging | Same installed runtime, headed; do not change mode on a browser another task is using |
| Existing authenticated/user session | Attach to the exact authorized CDP endpoint/profile; list tabs before selecting an existing target ID |
| A managed agent-browser service/desktop session | Follow agent-browser / agent-browser-service ownership and profile guidance; reuse its route rather than launch a competing browser |
| v1/Puppeteer evaluation | Only when explicitly requested; isolated evaluation runtime and profiles, never an automatic fallback or default upgrade |

On this WSL host, the validated managed-browser default remains native Linux
chromium-stealthcdp 150 via `~/.dev-browser/config.json` `executablePath`.
Chromium 153 is available but has known headless interaction failures; a higher
version is not proof of suitability. Use another artifact only for a bounded,
explicit compatibility task with its own verification. Preserve the configured
path and the shared Chromium alias. Do not reinstall or change the default
runtime to resolve an ordinary navigation failure.

Scripts use QuickJS, not Node.js or v1's Puppeteer API. Named pages persist.
`--browser NAME` selects a separate browser/profile, not a tab. Avoid generating
fresh browser names on every call. `--profile-path` is a CDP discovery hint,
not an instruction to launch a new managed profile. Prefer an exact endpoint
for attachments when multiple sessions could be discovered.

Before browser work, record the selected runtime, browser name/profile or
endpoint, existing tabs, and which resources this task creates versus borrows.
Reuse one task-owned browser across steps. For a shared session, record owned
tab IDs separately; never equate a matching URL or process name with ownership.
Use status/browser inventory only while intentionally operating the runtime:
`dev-browser status` and `dev-browser browsers` can start an absent daemon.

## Tab and resource budget

- Default to one active browser and one working tab per task. Allow up to three
  task-owned tabs when comparison requires it; close a finished tab before
  opening another. Raise that working budget only for a concrete task need
  after checking available memory and other active work, and record the reason.
- Prefer `browser.newPage()` for disposable work; anonymous pages are cleaned
  up when the script exits. Use `browser.getPage("task-purpose")` only when the
  page needs to persist across steps. Inspect `browser.listPages()` before
  creating another persistent page.
- Use finite script timeouts and serial browser operations by default. Do not
  spawn more browsers or daemons because a request timed out; inspect and
  reconcile the existing task-owned session first. Stop expanding work under
  memory pressure and close expendable owned tabs before retrying.
- Close owned named pages with `await browser.closePage("task-purpose")` on
  success, failure, or cancellation once they are no longer needed. Do not close
  pre-existing user tabs or another task's tabs, or delete profiles/cookies.
- For unattended work, use `--idle-timeout 5m` when starting an exclusively
  owned runtime or where that shared cleanup policy is already agreed. This
  updates the daemon's policy for all managed browsers; it is not a per-task
  lease. Do not silently override another task's retention policy, and do not
  use `0` merely for convenience. Idle reaping preserves profiles, does not
  reap running requests, and never closes attached external browsers.
- `dev-browser stop` is global: it stops the daemon and all its browser
  connections. There is no `stop NAME` CLI in this version. Use it at task end
  only when inventory establishes that the daemon has no other active owners
  and all managed work is finished. Otherwise close this task's tabs, retain
  shared connections needed by others, and explicitly report the remaining owner.
- Attachment does not transfer browser ownership. Never terminate the external
  browser or its service/desktop to clean up a dev-browser task. Follow the
  owning service's release/detach workflow; do not use broad `pkill`/`killall`.

## Completion and handoff

Capture required results, close expendable owned tabs, and stop an exclusively
owned idle runtime. Idle timeout is a backstop, not a substitute for cleanup.
After cleanup, inspect OS processes by recorded PID, parentage and profile/path;
verify owned browser/daemon processes actually exited. A CLI success or empty
browser list alone does not prove cleanup. Do not run `status` after stopping
just to verify it: that command can recreate the daemon.

If work must remain open, record the exact browser/profile, owned tabs/PIDs,
reason, responsible task/owner, and expected expiry or next cleanup action.
Treat ambiguous ownership as a reason for bounded inspection, never blanket
termination. Finish with the selected runtime, resources closed, and anything
intentionally retained. Do not leave unused daemons, browsers, or tabs silently.

## Common Commands

```bash
. "$HOME/.cargo/env"

dev-browser --browser task-example --headless <<'EOF'
const page = await browser.newPage();
await page.goto("https://example.com", { waitUntil: "domcontentloaded" });
console.log(await page.title());
EOF
```

```bash
. "$HOME/.cargo/env"

dev-browser --browser task-attachment --connect <<'EOF'
const tabs = await browser.listPages();
console.log(JSON.stringify(tabs, null, 2));
EOF
```

```bash
. "$HOME/.cargo/env"

dev-browser --browser task-attachment --connect --port 9333 <<'EOF'
const tabs = await browser.listPages();
console.log(JSON.stringify(tabs, null, 2));
EOF
```

```bash
. "$HOME/.cargo/env"

dev-browser --browser task-attachment --connect --profile-path ~/.config/google-chrome-agent <<'EOF'
const tabs = await browser.listPages();
console.log(JSON.stringify(tabs, null, 2));
EOF
```

```bash
. "$HOME/.cargo/env"

dev-browser --browser task-attachment --connect --profile-path "/mnt/c/Users/<WindowsUser>/AppData/Local/Google/Chrome/User Data" <<'EOF'
const tabs = await browser.listPages();
console.log(JSON.stringify(tabs, null, 2));
EOF
```

## Operating Notes

- Prefer direct Playwright actions when the target is known
- Use persistent named pages to avoid re-navigation across turns
- Use `--connect` only when the user wants to work inside an existing Chrome session
- For command details and API reference, run `dev-browser --help`
