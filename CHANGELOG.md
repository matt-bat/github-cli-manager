# Changelog

## 0.1.0 - 2026-06-28

Initial MVP release candidate.

### Added

- Local-only Electron desktop shell.
- Setup readiness checks for GitHub CLI, Git, and `gh auth status`.
- Beginner-friendly browser sign-in flow through local `gh auth login --web`.
- Grouped workspace UI: Home, Work, Repository, Automation, Security, Explore, Advanced, Activity, and Settings.
- Home dashboard with setup readiness, repository context, next actions, and recent activity.
- Guided read workflows for common repository, pull request, issue, release, Actions, and security commands.
- Full `gh` command catalog loaded from `docs/gh-command-coverage.md`.
- Advanced runner for full `gh` commands and approved read-only `git` commands.
- Command preview, risk classification, command allowlisting, token redaction, and local Activity log.
- Electron IPC bridge with no product-facing localhost server.
- Validation tests for command parsing, command safety, auth command construction, catalog loading, UI shell release regressions, and browser-level onboarding flow.
- Headless screenshot capture for release UI evidence.
- Packaged-directory build gate through electron-builder.

### Security

- Commands execute with `shell: false` and argument arrays.
- Executable allowlist is limited to `gh` and approved read-only `git` commands.
- `cd` is rejected as a command; working directory is modeled as app state.
- Common GitHub token shapes are redacted from previews and Activity.

### Known Gaps

- Packaged directory validation exists, but signed platform installers are not produced yet.
- Setup guidance exists, but one-click dependency installation is not fully implemented.
- Write and destructive workflows rely on guarded Advanced runner until dedicated forms are built.
