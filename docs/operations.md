# Operations

## Current State

This repository contains a runnable Electron implementation slice. The app is a local desktop process with a static renderer UI that silently executes approved local `gh` and read-only `git` commands in the background.

Implemented:

- Electron desktop shell;
- setup readiness checks for `gh`, Git, and `gh auth status`;
- clean grouped desktop UI with Home, Work, Repository, Automation, Security, Explore, Advanced, Activity, and Settings areas;
- Home dashboard with setup readiness, repository context, next actions, and recent session activity;
- guided read commands for Home, Repository, Pull Requests, Issues, Releases, Actions, and Security;
- command catalog loaded from `docs/gh-command-coverage.md`;
- Advanced runner for validated full `gh` commands and approved read-only `git` commands with a human-readable review panel and command-catalog search;
- session Activity log;
- unit tests for command catalog loading, command parsing, risk scoring, redaction, command allowlisting, and guided command construction.
- release readiness gate through `npm run release:check`;
- Playwright onboarding flow and headless UI screenshot capture;
- packaged-directory validation through electron-builder;
- release notes and manual release runbook.

Not implemented yet:

- packaged desktop installer;
- one-click dependency installation;
- complete guided forms for all write/destructive commands;
- persistent encrypted settings;
- full browser test suite.

## Local Run

```bash
npm install
npm start
```

This opens the desktop app. No localhost server is part of the product runtime.

## Local-Only Runtime Policy

- The app runs on the user's machine.
- `gh`, approved read-only Git commands, installers, and command previews run locally.
- No hosted service, cloud relay, or shared command execution backend is part of the MVP.
- Commands must not open a terminal window by default.
- Only `gh` and approved read-only `git` commands may execute.
- `cd` is modeled as the app working-directory field, not as an executable command.
- Command output should be captured and summarized in app-owned Activity and result panels.
- Expert terminal-style commands may use an embedded terminal layer only after explicit user consent.

## Local Validation

Validate the current implementation:

```bash
npm run check
npm test
npm run release:check
```

Release preparation and manual publish commands are documented in [release.md](release.md).

## Future Development Checks

Future work should add and document exact commands for:

- linting;
- type checking;
- integration tests with mocked `gh`;
- end-to-end UI tests.

## Setup Operations

The first-run setup wizard should verify:

- operating system and CPU architecture;
- installed `gh` version;
- installed Git version;
- whether `gh` and Git are visible on PATH from the app process;
- whether a supported package manager or installer path is available;
- `gh auth status`;
- write access to app config, cache, and download directories.

Missing dependencies should be handled in this order:

1. one-click app-managed install when safe and supported;
2. copyable command with explanation when a package manager is available;
3. download link or manual instructions when automation is blocked;
4. retry verification after install;
5. concise support diagnostic if setup still fails.

## Runtime Readiness Checks

The app should check:

- `gh` binary is available;
- `gh auth status` succeeds;
- selected repository is accessible;
- local file paths selected for assets or notes exist;
- download destination is writable.
- high-risk scopes are present before secrets, variables, workflow, project, organization, or codespace actions.

## Release Operation Policy

- Read operations may run after repository selection.
- Write operations require a review layer.
- Destructive operations require typed confirmation.
- Secret, token, and key material must never be echoed into Activity.
- CLI commands execute silently by default and expose output only through app UI.
- Cleanup tag is never implied by release deletion.
- Overwrite behavior is never implied for upload or download conflicts.
