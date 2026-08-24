# Contributing to GitHub CLI Manager

Contributions should improve safe, understandable local GitHub workflows without weakening command boundaries or exposing authentication material.

## Before opening an issue

1. Search existing issues and reproduce the behavior on the latest `main` branch.
2. Record the operating system, app revision, and redacted `gh --version` output.
3. Remove repository paths, tokens, secrets, and private command output from screenshots or logs.
4. Report command-injection, credential, authorization, or destructive-confirmation issues privately through [SECURITY.md](SECURITY.md).

## Local setup

```sh
npm install
npm start
```

Use a test GitHub account or disposable repository when a workflow could mutate GitHub state.

## Validate a change

```sh
npm run check
npm test
npm run test:e2e
```

For release-facing changes, also run `npm run release:check` when the required browser and packaging dependencies are available.

## Pull request expectations

- Keep renderer requests typed and treat main-process validation as authoritative.
- Invoke only approved executables with argument arrays; never interpolate user input into a shell string.
- Preserve risk labels, redacted previews, explicit destructive confirmations, cancellation, and structured error handling.
- Do not store GitHub tokens, environment variables, secret values, or sensitive local paths in Activity history.
- Add tests for command construction, rejection paths, and user-visible workflows changed by the pull request.
- Update command coverage and architecture documentation when supported behavior or boundaries change.
- List validation performed and any checks that could not run.

By contributing, you agree that your contribution is distributed under the repository’s license.
