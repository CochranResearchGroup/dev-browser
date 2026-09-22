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
Activation completed after explicit approval to close the 10 previous sessions.
The installed CLI launched a fresh named browser without an executable override;
daemon status reported the configured Linux artifact, and the script passed a
real textbox fill, ordinary locator click, title check (`stealth-default-ok`),
ARIA snapshot, and `navigator.webdriver === false` check. Its user agent reported
HeadlessChrome/150.0.0.0. Installed daemon and sandbox bundle bytes match the
rebuilt repository bundles.

The process census found an extra startup daemon and a verification process
tree that did not finish graceful shutdown. Those exact processes were removed;
the final daemon is PID 77326 with zero browsers, ready to launch the configured
default. The old PID 63226 and the temporary daemon/browser processes are gone.
The activation changed no Chromium artifact aliases.
