# Release Runbook

Last updated: 2026-06-28

## Scope

This project is release-ready when the local validation gate passes and the release notes are current. Release publishing is manual and must be explicitly requested before any tag push or GitHub release creation command runs.

## Current Release Candidate

- Version: `0.1.0`
- Package name: `github-cli-manager`
- Runtime: local Electron desktop app
- Release type: MVP release candidate
- Changelog: [../CHANGELOG.md](../CHANGELOG.md)

## Required Local Gate

Run from `git-release-manager/`:

```bash
npm run release:check
```

This runs:

- JavaScript syntax checks for the Electron main process, command runner, command catalog, setup checks, and renderer script.
- Node test suite.
- Playwright browser flow test with a mocked local desktop bridge.
- Headless screenshot capture for Home, authenticated Home, Releases, Advanced preview, and Settings.
- Electron packaged-directory build.
- Moderate-or-higher dependency audit.

## Manual Smoke Check

```bash
npm start
```

Confirm:

- the app opens as a desktop window;
- Home shows setup, context, next actions, and activity sections;
- the GitHub Sign In panel shows a clear browser sign-in action when `gh` is installed but auth is missing;
- Work, Repository, Automation, Security, Explore, Advanced, Activity, and Settings tabs switch correctly;
- Advanced preview rejects invalid executables and accepts a read-only command such as `gh repo view cli/cli`;
- no localhost server is required.

## Screenshot Evidence

Headless release screenshots are captured by:

```bash
npm run screenshots:capture
```

Current screenshot artifacts:

- [01-home-auth-needed.png](screenshots/01-home-auth-needed.png)
- [02-home-auth-ready.png](screenshots/02-home-auth-ready.png)
- [03-work-releases.png](screenshots/03-work-releases.png)
- [04-advanced-preview.png](screenshots/04-advanced-preview.png)
- [05-settings.png](screenshots/05-settings.png)

## Git Repository Requirement

This directory must be inside a valid Git repository before tagging. In the current workspace, `git-release-manager/` is a project directory, but Git did not recognize the parent directory as a usable repository during release preparation.

Before publishing, choose one path:

- Move or keep `git-release-manager/` inside a valid existing repository.
- Initialize this directory as its own repository and add the intended remote.

Example for a standalone repository:

```bash
git init
git add .
git commit -m "Prepare git-release-manager v0.1.0"
git branch -M main
git remote add origin <repository-url>
```

## Tag And GitHub Release

Only run these after `npm run release:check` passes and the release owner approves publishing:

```bash
git status --short
git add .
git commit -m "Prepare git-release-manager v0.1.0"
git tag git-release-manager-v0.1.0
git push origin HEAD
git push origin git-release-manager-v0.1.0
gh release create git-release-manager-v0.1.0 --title "GitHub CLI Manager v0.1.0" --notes-file CHANGELOG.md
```

If this subproject is released from a parent monorepo, run these commands from the parent repository root and adjust `git add` plus `--notes-file` paths accordingly.

## Rollback

Before pushing a tag:

```bash
git tag -d git-release-manager-v0.1.0
```

After pushing a tag but before creating a GitHub release:

```bash
git push origin :refs/tags/git-release-manager-v0.1.0
git tag -d git-release-manager-v0.1.0
```

After creating a GitHub release, delete the GitHub release first, then delete the tag only if the release owner approves tag cleanup.

## Release Decision

The current candidate is a `go-with-risk` for MVP source/tag release because the automated local gate passes, but signed platform installers and one-click dependency installation are not implemented yet.
