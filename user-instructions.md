# User Instructions Tracker

## Status Model

Allowed status values:

- `pending`
- `in_progress`
- `blocked`
- `done`
- `won_t_do`

## Tracker

| Instruction ID | Instruction | Source | Status | Priority | Owner | Last Updated UTC | Evidence | Notes |
|---|---|---|---|---|---|---|---|---|
| INST-000 | Backfill tracker for newly bootstrapped repository instructions. | 2026-06-28 repository bootstrap | done | medium | model | 2026-06-28T16:40:43Z | `user-instructions.md` created | No prior repository-specific instruction history was present in this empty project. |
| INST-001 | Use repo skills and flesh out a fully detailed MVP for an easy-to-use GitHub release manager using `gh` CLI backend and clean sectioned/tabbed/layered UI. | 2026-06-28 user request | done | high | model | 2026-06-28T16:40:43Z | `README.md`; `docs/mvp-spec.md`; `docs/architecture.md`; `docs/operations.md` | MVP scope, UI, backend, command coverage, validation, and milestones documented. |
| INST-002 | Expand the MVP to utilize all `gh` commands, not just release commands. | 2026-06-28 user follow-up | done | high | model | 2026-06-28T16:50:08Z | `docs/gh-command-coverage.md`; `docs/mvp-spec.md`; `README.md`; `docs/architecture.md`; `docs/operations.md` | Every command from `gh help reference` now has a documented guided, structured-form, or advanced-runner path. |
| INST-003 | Ensure the product is a locally run app that silently executes CLI commands and makes `gh` plus dependency setup seamless for inexperienced users. | 2026-06-28 user follow-up | done | high | model | 2026-06-28T16:56:52Z | `README.md`; `docs/mvp-spec.md`; `docs/architecture.md`; `docs/operations.md`; `docs/setup.md` | Local-only runtime, silent subprocess execution, first-run setup wizard, guided installs, verification, and manual fallback documented. |
| INST-004 | Start building the GitHub CLI Manager app. | 2026-06-28 user request | done | high | model | 2026-06-28T17:14:28Z | `package.json`; `src/`; `public/`; `test/command-runner.test.js`; `README.md`; `docs/operations.md`; `docs/architecture.md` | Runnable Electron app created with setup checks, tabbed UI, guided read commands, advanced runner, Activity log, and tests. |
| INST-005 | Make the app a modern local desktop UI that sends allowed commands from the user's computer in the background, allowing `gh` plus safe `git` commands and using a working-directory field instead of shell `cd`. | 2026-06-28 user correction | done | high | model | 2026-06-28T17:34:26Z | `src/main.js`; `src/preload.cjs`; `src/command-runner.js`; `src/command-catalog.js`; `public/index.html`; `public/app.js`; `test/command-runner.test.js`; `test/command-catalog.test.js`; `README.md`; `docs/architecture.md`; `docs/operations.md`; `docs/setup.md` | Product runtime is Electron IPC, not localhost. Command policy allows `gh` and approved read-only `git`, rejects `cd` and unrelated executables, executes with `shell:false`, and exposes the full `gh` catalog in-app. |
| INST-006 | Keep iterating on the app design from a master app designer and UX perspective. | 2026-06-28 user request | done | high | model | 2026-06-28T21:34:29Z | `public/index.html`; `public/styles.css`; `public/app.js`; `docs/architecture.md`; `docs/operations.md` | Navigation reduced into grouped workspace areas, Home became a dashboard, command cards became denser rows, Advanced gained command search plus human-readable preview, asset paths were fixed for Electron file loading, and tab accessibility improved. |
| INST-007 | Get the app ready for git release. | 2026-06-28 user request | done | high | model | 2026-06-29T03:20:22Z | `package.json`; `CHANGELOG.md`; `docs/release.md`; `test/ui-shell.test.js`; `docs/governance/2026-06-28-release-readiness.governance.md`; `docs/governance/2026-06-28-release-readiness.governance.json`; `npm run release:check` | Release gate, release notes, runbook, governance evidence, and UI shell regression test added. `npm run release:check` passed with 16 node tests, 1 Playwright test, screenshots, packaged-directory build, and 0 vulnerabilities. |
| INST-008 | Fix release issues, improve everything possible, add the smoothest basic-user auth flow, capture headless interface screenshots before pushing, and push when good to go. | 2026-06-28/2026-06-29 user requests | done | high | model | 2026-06-29T04:29:13Z | `src/setup.js`; `src/main.js`; `src/preload.cjs`; `public/`; `e2e/app-shell.spec.js`; `scripts/capture-screenshots.mjs`; `docs/screenshots/`; `package.json`; `npm run release:check` | Auth flow, E2E, screenshots, package metadata, license, and packaging gate added. Full release gate passed after screenshot capture. |
| INST-009 | Create a new public GitHub repository with description, topics, and discoverability metadata, then push the completed project. | 2026-06-29 user request | done | high | model | 2026-06-29T04:35:00Z | `package.json`; `README.md`; `LICENSE`; `https://github.com/matt-bat/github-cli-manager`; `git push -u origin main`; `gh repo edit --add-topic ...` | Public repo created under `matt-bat/github-cli-manager`, description/homepage/topics set, and `main` pushed. |
