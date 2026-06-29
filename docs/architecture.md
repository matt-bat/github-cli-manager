# Architecture

## Overview

GitHub CLI Manager is currently a local-only Electron desktop workspace with a dependency-free renderer, an Electron main-process backend, and the user's local GitHub CLI as the execution engine.

```text
Electron Renderer
  -> typed action request
Electron Main Process
  -> validated command builder
  -> silent subprocess: gh/git ...
GitHub CLI / Git
  -> GitHub API through existing gh authentication
```

## Boundaries

- Front end owns interaction design, validation hints, command review, and user confirmations.
- Main process owns authoritative validation, command construction, silent local process execution, cancellation, output capture, and error mapping.
- `gh` owns GitHub authentication, API calls, Git integration, and GitHub mutations.
- Setup wizard owns dependency detection, beginner-safe install guidance, and post-install verification.

No server-hosted command executor, cloud relay, shared backend, or remote worker is part of the MVP.

## Command Safety

Backend implementation must:

- invoke `gh` with argument arrays;
- invoke approved read-only `git` commands with argument arrays;
- execute commands without opening a terminal window by default;
- avoid shell string interpolation;
- reject `cd` execution and use a working-directory setting instead;
- reject every executable other than `gh` and approved read-only `git`;
- redact sensitive paths or tokens from previews if any appear;
- reject malformed repository identifiers;
- require explicit confirmation tokens for destructive requests;
- mark commands as `read`, `write`, or `destructive`.

## UI Architecture

Root tabs:

- Home
- Work
- Repository
- Security
- Automation
- Explore
- Advanced
- Activity
- Settings

Grouped domain layers:

- Work: Pull Requests, Issues, Releases
- Automation: Actions, Projects, Codespaces
- Explore: Gists, Search

Layers:

- Detail
- Edit
- Review
- Danger
- Result

The repository context bar is the home anchor and must return users to Home in one action.
The Advanced runner must show a human-readable preview before execution, with raw output reserved for results and diagnostics.

## Data Flow

1. UI collects user intent in typed form state.
2. UI asks backend to validate and preview command.
3. Backend returns warnings, errors, redacted arguments, and risk level.
4. UI shows Review or Danger layer.
5. User confirms.
6. Main process executes approved commands silently as local subprocesses.
7. Backend returns structured command result.
8. UI refreshes affected release data and writes Activity entry.

## Setup Architecture

The setup system must run before the main workspace when prerequisites are missing:

1. Detect operating system, CPU architecture, `gh`, Git, package manager availability, PATH visibility, and authentication state.
2. Classify each prerequisite as ready, installable by the app, manually installable, or blocked.
3. Offer a plain-language setup step with one primary action.
4. Run the selected installer or guided command locally.
5. Re-run silent verification.
6. Continue to authentication and repository setup only after required dependencies are ready.

The app should prefer platform-native installers and package managers where available, but every automated step must show what will be installed before it starts.

## Parsing Strategy

Use `--json` fields where commands support them. Preserve raw stdout and stderr for diagnostics, because CLI formatting and available fields can vary by version.

## Command Coverage Strategy

Commands are grouped into three UX tiers:

- Guided workflow: common, high-value commands receive dedicated forms and detail layers.
- Structured command form: less common commands receive generated forms from a maintained command manifest.
- Advanced runner: expert-only or highly variable commands expose a guarded argument builder with preview, risk scoring, and command history.

Every installed `gh` command must have one of these paths. See [gh-command-coverage.md](gh-command-coverage.md).

The first implementation slice includes guided read commands for common domains, a full `gh` command catalog loaded from documentation, and an Advanced runner that validates full `gh` commands plus approved read-only `git` commands. Full bespoke forms remain incremental work.

## Security Notes

- Do not store GitHub credentials.
- Do not execute commands on a remote host or shared service.
- Do not persist secret, variable, token, or key material in Activity.
- Do not log environment variables.
- Do not pass user input through a shell.
- Treat local file paths as sensitive in shared diagnostics.
- Keep destructive audit entries local unless the user exports them.
