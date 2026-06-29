# Setup Experience

Last updated: 2026-06-28

## Goal

Make first-run setup seamless for users who are not comfortable with terminals, package managers, PATH issues, or GitHub CLI authentication.

## Product Requirement

GitHub CLI Manager is a locally run desktop app. It should install, verify, and use local dependencies, then execute approved `gh` and read-only `git` commands silently in the background. Users should not need to manually open a terminal for normal setup or normal operations.

## First-Run Setup Flow

1. Welcome: explain that the app runs locally and uses GitHub CLI on the user's machine.
2. System check: detect operating system, CPU architecture, `gh`, Git, PATH visibility, package manager availability, and app write permissions.
3. Install plan: show missing dependencies with one primary action per dependency.
4. Install: run approved local installer steps with progress and cancel support.
5. Verify: silently run `gh --version`, `git --version`, and `gh auth status` when applicable.
6. Authenticate: provide a single "Sign in with GitHub" action that runs `gh auth login --web --git-protocol https --hostname github.com`, waits for completion, and silently rechecks setup.
7. Repository setup: detect current repository or ask for `OWNER/REPO`.
8. Finish: open Home with setup status saved locally.

## Dependency Handling

### GitHub CLI

Required for all GitHub operations.

Setup behavior:

- If `gh` is installed and visible to the app, verify version and continue.
- If `gh` is installed but not visible on PATH, explain the PATH issue and offer a restart/recheck flow.
- If missing, offer platform-specific installation.
- If automated install is blocked, provide copyable manual steps and a recheck button.

### Git

Required for local repository detection, clone, pull request checkout, repository sync, and tag-related workflows.

Setup behavior:

- If Git is missing, allow read-only remote workflows that do not require Git only when `gh` is ready.
- Explain which features are disabled until Git is installed.
- Offer guided install and recheck.

### App Runtime Dependencies

The shipped app should bundle as much runtime as practical. If the selected implementation stack requires external runtime dependencies during development or self-hosted use, setup must:

- identify the missing runtime;
- explain why it is needed;
- offer guided install;
- verify after installation;
- keep the main app unavailable until required runtime pieces are ready.

## Silent Command Execution

Normal operations must not pop open a terminal window.

Backend requirements:

- spawn `gh` and approved read-only Git commands as child processes with argument arrays;
- reject shell built-ins such as `cd`; use the app working-directory setting instead;
- reject unrelated executables;
- capture stdout, stderr, exit code, duration, and cancellation state;
- show friendly summaries by default;
- keep raw output available in Activity for troubleshooting;
- redact sensitive output before display or persistence;
- avoid shell interpolation.

Allowed exception:

- Advanced terminal-like operations such as codespace SSH may open an embedded terminal layer, but only after the user explicitly chooses that mode.

## Setup UI Requirements

- Use plain-language labels: "Install GitHub CLI", "Install Git", "Sign in to GitHub", "Recheck".
- Avoid package-manager jargon unless the user opens details.
- Show progress as steps, not logs.
- Keep technical logs hidden behind "Details".
- Explain permission prompts before requesting them.
- Provide "I installed it, check again" after every manual path.
- Never ask the user to paste a token unless no safer local auth flow is available.

## Failure States

| Failure | User Message | Recovery |
|---|---|---|
| `gh` not found | GitHub CLI is not installed or the app cannot find it. | Install, add to PATH, restart app, recheck. |
| Git not found | Git is missing, so local repository features are unavailable. | Install Git or continue with remote-only features. |
| PATH mismatch | The dependency may be installed, but this app cannot see it yet. | Restart app, choose binary path, or recheck after shell profile update. |
| Auth missing | GitHub CLI is installed but not signed in. | Click "Sign in with GitHub" to start the browser-based `gh auth login` flow. |
| Permission denied | The installer needs permission to continue. | Explain permission prompt, retry, or switch to manual install. |
| Unsupported package manager | Automatic install is unavailable on this machine. | Show manual install steps and recheck. |

## Acceptance Criteria

- A novice user can get from first launch to authenticated Home without typing a command in normal conditions.
- GitHub authentication starts from an in-app button and returns to a rechecked setup state.
- Missing `gh` and Git are detected before the main workspace is shown.
- Setup offers automated install or guided manual fallback for each missing dependency.
- Verification runs silently after each setup step.
- Normal app operations execute local CLI commands without opening a terminal window.
- Activity shows command summaries and redacted raw output on demand.
- Setup state is saved locally and can be re-run from Settings.
