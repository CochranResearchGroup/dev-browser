# WSL browser default

The local WSL configuration uses native Linux chromium-stealthcdp through
`executablePath` in `~/.dev-browser/config.json`:

```text
/home/ecochran76/workspace.local/chromium/artifacts/chromium-stealthcdp/150.0.7835.0+stealthcdp.3676a7503929/chrome-linux/chrome
```

The executable SHA-256 matches the promoted artifact manifest:
`aebeac48273efa3a2767763cf0694cfa8f1be52c91b7fbafff0d4698a993ffce`.
The shared Chromium `current` alias still points to its Windows artifact.

## Behavior

New daemon-managed browsers read the configured absolute executable path.
Headed and headless launches use the same build and keep dev-browser's own
persistent profiles. Existing browser instances retain their original binary.
CDP attachment is unaffected. Invalid configuration or launch failure is an
error, without silently substituting bundled Chromium. Removing the setting
restores the bundled-browser default.

## Validation

- TypeScript, both embedded bundle builds, daemon formatting, Rust formatting,
  Rust build, and all 12 Rust tests passed.
- All 173 daemon tests passed, including configured executable selection,
  default fallback when unset, invalid settings, launch errors, CDP isolation,
  and browser-status reporting.
- A real QuickJS/Playwright smoke passed in both headed (Xvfb) and headless
  modes using temporary profiles. It checked the CDP-reported executable,
  browser version, textbox fill, a normal locator click, resulting title,
  ARIA snapshot, and `navigator.webdriver === false`. See
  [the smoke receipt](validation/wsl-stealth-browser-smoke.json).
- The promoted 153.0.8003.0 build was not selected: normal locator clicks
  timed out while waiting for element stability, reproduced without QuickJS
  using the pinned Playwright 1.58.2, in headed and headless modes. Bringing
  the page to the front and using navigation instead of setContent did not
  resolve it. The 150 build passed the equivalent test.

## Installed activation

The previous CLI and the config-absence marker were saved under
`~/.dev-browser/backups/wsl-stealth-default-20260922T015934Z/`.
The config is prepared and the rebuilt CLI is installed separately from the
running daemon. The old daemon has 10 browser sessions; activating the new
daemon requires permission to close those sessions. Until that restart,
the running daemon continues to use its original implementation.
