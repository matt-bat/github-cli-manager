# Release Readiness Governance

Task ID: `2026-06-28-release-readiness`

## Mode

- Profile: internal
- Mode: standard
- Execution scope: local only
- Critical override: no
- Risk score: 6

## Gates

| Gate | Status | Evidence |
|---|---|---|
| Release script added | passed | `package.json` defines `npm run release:check`. |
| Release notes current | passed | `CHANGELOG.md` documents the `0.1.0` release candidate. |
| Release runbook current | passed | `docs/release.md` documents validation, tag, release, and rollback commands. |
| Automated release check | passed | `npm run release:check` passed on 2026-06-29T03:20:22Z: syntax checks passed, 16 node tests passed, 1 Playwright test passed, screenshots captured, packaged-directory build passed, and `npm audit` found 0 vulnerabilities. |
| Browser E2E | passed | `npm run test:e2e` covers beginner auth, grouped navigation, release segment, and Advanced preview. |
| Screenshot evidence | passed | `docs/screenshots/` contains Home auth-needed, Home auth-ready, Work Releases, Advanced preview, and Settings screenshots. |
| Packaged directory build | passed | `npm run package:dir` produced `dist/linux-unpacked`. |

## Residual Risks

- Signed platform installers are not produced yet.
- One-click dependency installation is not fully implemented.
- No usable Git remote is configured in this workspace yet.

## Recommendation

`go-with-risk` for source/tag release.

The automated release gate passes. Remaining risk is acceptable for an MVP source release, but signed installers, one-click dependency installation, and Git remote configuration are still open.
