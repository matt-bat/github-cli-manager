# GitHub CLI Manager MVP Specification

Last updated: 2026-06-28

## 1. Product Contract

### Goal

Build a clean, easy-to-use, locally run GitHub CLI manager that exposes the practical full `gh` command surface through guided workspaces, structured command forms, and a safe local backend. The app silently executes local CLI commands in the background and keeps terminal complexity hidden from normal users. Release management remains a first-class workflow, but the MVP must also cover repositories, pull requests, issues, Actions, projects, codespaces, gists, secrets, variables, keys, search, API, extensions, aliases, and configuration.

### Primary User Roles

- Maintainer: manages repositories, pull requests, issues, releases, workflows, secrets, variables, labels, rulesets, and project boards.
- Release coordinator: reviews release readiness, workflow health, artifacts, tags, pull requests, and published release state.
- Contributor: creates issues and pull requests, checks status, reviews comments/checks, checks out branches, and opens GitHub surfaces without knowing CLI syntax.
- Platform operator: manages Actions caches, secrets, variables, keys, codespaces, extensions, and organization/project resources.
- Expert user: needs access to `gh api`, extensions, aliases, formatting, templates, and command-level escape hatches without losing safety controls.
- Novice user: needs the app to install or guide installation of `gh`, Git, and required dependencies without requiring terminal fluency.

### Minimum Acceptable Success State

A user can install missing prerequisites, authenticate GitHub CLI, select a repository or account context, perform common GitHub work through guided tabs, execute every installed `gh` command through either a dedicated workflow, structured form, or advanced runner, and recover from errors without manually composing shell commands.

### In Scope

- Full installed `gh` command inventory covered by [gh-command-coverage.md](gh-command-coverage.md).
- Guided workflows for high-frequency domains: auth readiness, repositories, pull requests, issues, releases, Actions runs/workflows/cache, secrets, variables, keys, labels, rulesets, search, gists, projects, and codespaces.
- Structured command forms for lower-frequency commands that still need validation and safe previews.
- Advanced command runner for `gh api`, extension execution, codespace SSH/copy, and expert passthrough scenarios.
- Clean tabbed and layered UI that keeps primary workflows at root level.
- Local backend command wrapper around `gh` that silently executes subprocesses without opening terminal windows by default.
- First-run setup wizard for detecting, installing, authenticating, and verifying `gh`, Git, and app runtime dependencies.
- Structured error handling for authentication, repository, branch, issue, pull request, release, tag, asset, workflow, secret, variable, permission, and network failures.

### Out of Scope for MVP

- Direct GitHub REST or GraphQL mutation as the primary backend except when explicitly using `gh api`.
- Hosted multi-user service.
- Cloud relay, remote command execution, or shared backend command runner.
- Credential storage beyond using `gh`'s authenticated context.
- CI/CD workflow authoring or YAML editing beyond running, viewing, enabling, disabling, and inspecting workflows through `gh`.
- Semantic version generation automation beyond validation hints.
- Full changelog generation beyond `gh release --generate-notes` and notes inputs.
- Organization-wide release analytics.
- Replacing GitHub's native web UI for settings that `gh` does not expose.

### Assumptions

- The app runs locally on a user's workstation.
- The app can detect and help install `gh` and Git when missing.
- `gh` is installed and authenticated before GitHub operations run.
- The user can choose a repository either from current working directory context or explicit `[HOST/]OWNER/REPO`.
- The backend can read local files selected by the user for assets, notes, keys, env files, gist content, API bodies, and downloads.
- The app is implemented as an Electron desktop app; no product-facing local server is part of the runtime.

## 2. Whole-CLI Coverage Model

The MVP must support every command reported by `gh help reference`.

Coverage tiers:

1. Guided workflow: common commands with high product value or high risk get dedicated UI.
2. Structured form: less common commands get validated command-specific forms.
3. Advanced runner: expert commands get argument-token builder, preview, risk scoring, redaction, and confirmation controls.

Command coverage source of truth:

- [gh-command-coverage.md](gh-command-coverage.md)

### Domain Coverage Summary

| Domain | `gh` Commands | Root Surface | MVP Treatment |
|---|---|---|---|
| Authentication and setup | `auth`, `config`, `completion` | Settings and Home | Guided readiness plus structured config forms. |
| Repositories | `repo`, `browse`, `status` | Home and Repository | Guided repository management and browser actions. |
| Pull requests | `pr`, `co` | Pull Requests | Guided list, create, review, merge, checkout, status, checks, comments, and metadata. |
| Issues and labels | `issue`, `label` | Issues | Guided issue and label workflows. |
| Releases | `release` | Releases | Full guided release manager. |
| Actions | `workflow`, `run`, `cache` | Actions | Guided workflow/run/cache operations. |
| Projects and organizations | `project`, `org` | Projects | Guided project list/view/item work; structured admin operations. |
| Codespaces | `codespace` | Codespaces | Guided lifecycle/log/ports operations; advanced SSH/copy. |
| Gists | `gist` | Gists | Guided gist CRUD and view workflows. |
| Security material | `secret`, `variable`, `ssh-key`, `gpg-key`, `repo deploy-key`, `ruleset` | Security | Guided with redaction and confirmations. |
| Search | `search` | Search | Guided search builders. |
| Expert and extensibility | `api`, `alias`, `extension` | Advanced and Settings | Advanced runner plus structured extension/alias management. |

## 3. Local Setup and Execution Model

### Local-Only Constraint

The MVP is a locally run app:

- all `gh`, Git, package manager, and installer commands run on the user's machine;
- no command is sent to a hosted service for execution;
- no cloud worker or shared backend is allowed;
- app state, setup state, command history, and diagnostics stay local unless the user exports them.

### Silent CLI Execution

Normal operations must execute silently:

- no terminal window opens for guided or structured workflows;
- backend spawns child processes with argument arrays;
- stdout and stderr are captured and summarized in the UI;
- raw output is available in Activity details after redaction;
- long-running commands show progress, cancellation, and retry controls inside the app.

Allowed exception:

- terminal-like interactions such as codespace SSH may use an embedded terminal layer only after explicit user consent.

### Seamless Setup

First-run setup must handle:

- operating system and CPU architecture detection;
- `gh` detection, installation guidance, version verification, and PATH repair;
- Git detection, installation guidance, version verification, and feature gating;
- app runtime dependency checks when relevant;
- `gh auth login` guidance without requiring the user to type the command;
- post-install silent verification;
- manual fallback steps when automated install is blocked.

Detailed setup requirements live in [setup.md](setup.md).

## 4. Release Command Coverage Matrix

The Releases workspace should cover the installed `gh release` command surface below.

| Capability | `gh` command | Required UI Surface | MVP Behavior |
|---|---|---|---|
| Select repository | `-R, --repo [HOST/]OWNER/REPO` | Global repository switcher | Apply repository context to every operation and show current repo persistently. |
| List releases | `gh release list` | Releases tab | Show releases with status, tag, title, age, latest indicator, asset count when available, and quick filters. |
| List filters | `--exclude-drafts`, `--exclude-pre-releases`, `--limit`, `--order` | Releases tab filter bar | Let users hide drafts/prereleases, choose list size, and sort ascending or descending. |
| List formatting | `--json`, `--jq`, `--template` | Backend only | Use JSON output for parsing; do not expose raw templates in MVP UI. |
| View release | `gh release view [tag]` | Detail layer | Show latest release by default or selected tag details. |
| View in browser | `--web` | Detail layer action | Open GitHub release page as an explicit secondary action. |
| Create release | `gh release create [tag] [files...]` | Create tab and review layer | Build the command from validated form fields and show a review step before execution. |
| Create draft | `--draft` | Create tab status control | Save as draft when enabled. |
| Create prerelease | `--prerelease` | Create tab status control | Mark release as prerelease when enabled. |
| Mark latest | `--latest` | Create and edit latest control | Allow automatic default, explicitly latest, and edit latest. |
| Title | `--title` | Title input | Optional title, with generated title hint when using generated notes. |
| Notes string | `--notes` | Notes editor | Inline Markdown notes. |
| Notes file | `--notes-file` | Notes source picker | Load notes from selected file or pass selected file path. |
| Generated notes | `--generate-notes` | Notes mode segmented control | Generate title/notes, optionally prepending inline notes. |
| Notes from tag | `--notes-from-tag` | Notes mode option | Use annotated tag notes. |
| Notes start tag | `--notes-start-tag` | Generated notes advanced field | Set comparison start point for generated notes. |
| Target | `--target branch` | Tag and target section | Choose target branch or commit SHA for automatic tag creation. |
| Verify tag | `--verify-tag` | Tag safety toggle | Abort release if remote tag does not exist. |
| Discussion category | `--discussion-category` | Collaboration section | Start discussion in selected category by name. |
| Upload assets during create | positional files | Assets section | Attach files with optional display labels before create. |
| Edit release | `gh release edit <tag>` | Edit layer | Modify title, notes, tag, target, draft, prerelease, latest, verify tag, and discussion category when publishing draft. |
| Rename tag | `--tag` | Edit advanced section | Change tag with explicit warning about downstream impact. |
| Publish draft | `gh release edit <tag> --draft=false` | Publish action | Convert draft to published release with review confirmation. |
| Upload assets | `gh release upload <tag> <files...>` | Assets layer | Add selected assets to existing release. |
| Upload overwrite | `--clobber` | Assets layer overwrite toggle | Replace assets with same name only after explicit confirmation. |
| Asset display label | `file#Label` | Asset row label field | Append display label syntax in command builder. |
| Download assets | `gh release download [tag]` | Downloads layer | Download all assets for selected tag, or latest with required pattern/archive. |
| Download archive | `--archive zip|tar.gz` | Downloads layer archive selector | Download source archive. |
| Download directory | `--dir` | Downloads destination picker | Select output directory. |
| Download output file | `--output` | Single asset output field | Save one asset to explicit file path. |
| Download pattern | `--pattern` | Pattern chips | Add one or more glob filters. |
| Download clobber | `--clobber` | Conflict behavior control | Overwrite same-name files after warning. |
| Download skip existing | `--skip-existing` | Conflict behavior control | Skip existing files. |
| Delete release | `gh release delete <tag>` | Danger layer | Require typed tag confirmation. |
| Delete tag with release | `--cleanup-tag` | Danger layer checkbox | Delete remote tag only when explicitly selected. |
| Delete asset | `gh release delete-asset <tag> <asset-name>` | Asset row danger action | Require confirm dialog naming asset and tag. |
| Skip confirmation | `--yes` | Backend only | Backend may pass `--yes` only after UI confirmation succeeds. |

## 5. Information Architecture

### Root Tabs

The UI should use flat root-level tabs:

1. Repository
2. Pull Requests
3. Issues
4. Releases
5. Actions
6. Projects
7. Security
8. Codespaces
9. Gists
10. Search
11. Advanced
12. Activity
13. Settings

The app title or repository switcher is the one-click home anchor. Clicking it returns to Home with the selected repository and latest refresh state.

### Layered Panels

Use layered panels instead of route detours:

- Detail layer: opens over any domain list for a selected item.
- Edit layer: opens from Detail and preserves domain context.
- Review layer: summarizes pending command, side effects, and command flags before execution.
- Danger layer: used for destructive operations.
- Result layer: shows success, copied command summary, and next actions.

### No-Scrollbar-First Layout

The default desktop viewport should avoid page-level scrollbars. Internal panes may scroll only where content is naturally long:

- Markdown body editors and previews.
- Activity log.
- Long lists such as assets, workflow logs, search results, project items, and comments.

Documented exception: long Markdown, logs, diffs, and search results require internal scroll to remain usable.

## 6. Visual Design Requirements

### Tone

- Quiet operational tool, not a marketing page.
- High contrast, restrained color, clear hierarchy.
- Dense enough for repeated release work, but not visually cramped.

### Layout

- Left rail or top segmented root tabs, depending on viewport width.
- Persistent repository context bar showing owner, repo, branch or target, auth status, and refresh.
- Primary content split into list/detail or form/review workspace.
- Primary actions pinned to the active panel footer.
- Destructive actions isolated in danger zones, never mixed into primary action groups.

### Components

- Repository switcher with recent repositories and explicit `OWNER/REPO` entry.
- Domain tabs with compact counts and status badges.
- Segmented controls for release state: published, draft, prerelease.
- Segmented controls for issue/PR state, workflow status, visibility, and secret scope.
- Toggles for verify tag, latest, cleanup tag, clobber, skip existing.
- File picker rows for assets, notes files, key files, env files, API input files, download directories, and output files.
- Markdown editor with preview toggle.
- Command preview drawer showing sanitized `gh` command arguments.
- Toasts for short success states; result panel for command output details.
- Empty states with direct action buttons, not explanatory paragraphs.

### Accessibility

- Full keyboard navigation for tabs, release rows, forms, dialogs, and confirmation actions.
- Visible focus states.
- Labels for every icon-only control.
- Destructive confirmation must be reachable without mouse.
- Error messages must identify the field or operation that failed.

## 7. Core User Flows

### Flow 0: First-Run Setup

1. User launches the app.
2. App silently checks operating system, CPU architecture, `gh`, Git, PATH, app write permissions, and authentication state.
3. Missing dependencies appear as setup cards with one primary action.
4. User installs or follows guided manual steps.
5. App silently verifies each dependency.
6. User completes guided GitHub sign-in.
7. App opens Home.

Acceptance:

- Normal setup does not require typing shell commands.
- Missing `gh` and Git are detected before unsupported features are available.
- Automated install explains permission prompts before they happen.
- Manual fallback includes copyable steps and a recheck button.
- Setup can be reopened from Settings.

### Flow A: First Repository Connection

1. User opens app.
2. Repository tab shows current directory repository if detectable.
3. If no repository is detected, user enters `[HOST/]OWNER/REPO`.
4. Backend runs a lightweight `gh` readiness check.
5. UI shows authenticated account, selected repo, and release access status.
6. Releases tab loads.

Acceptance:

- User can change repository without restarting.
- Failed auth explains how to run `gh auth login`.
- Failed repository access distinguishes not found, no permission, and invalid format when possible.

### Flow B: Home Command Center

1. User lands on Home.
2. App shows auth status, selected repository, personal `gh status`, recent pull requests, assigned issues, recent workflow failures, latest release, and command history.
3. User jumps into a domain tab or opens Advanced runner.

Acceptance:

- Home is useful without requiring the user to know the target command.
- All cards have one-click paths to the relevant tab.
- Failed cards show scoped recovery actions rather than blocking the whole app.

### Flow C: Pull Request Work

1. User opens Pull Requests.
2. User filters by state, author, assignee, review status, base, head, checks, labels, and draft.
3. User opens a pull request detail layer.
4. User reviews checks, diff, comments, metadata, and merge readiness.
5. User comments, reviews, checks out, marks ready, closes, reopens, locks, unlocks, or merges after review.

Acceptance:

- `gh pr list`, `view`, `checks`, `diff`, `comment`, `review`, `checkout`, `ready`, `close`, `reopen`, `lock`, `unlock`, and `merge` all have guided paths.
- Merge has a distinct confirmation layer with merge method, delete branch, auto-merge, admin, and head SHA controls.
- Checkout and diff operations show local side effects.

### Flow D: Issue and Label Work

1. User opens Issues.
2. User filters and selects issues or labels.
3. User creates, comments, edits, closes, reopens, locks, pins, transfers, or deletes issues.
4. User creates, edits, clones, lists, or deletes labels.

Acceptance:

- Issue destructive actions require confirmation.
- Bulk issue edit clearly shows all selected issue numbers.
- Transfer shows destination repository and requires confirmation.

### Flow E: Review Existing Releases

1. User opens Releases tab.
2. Release list loads with default limit 30 and descending order.
3. User filters drafts and prereleases.
4. User selects a release.
5. Detail layer shows tag, title, state, notes, assets, source archive links, and GitHub URL.

Acceptance:

- Latest release can be viewed without entering a tag.
- Refresh preserves filters and selected repository.
- JSON parsing errors fall back to readable raw output in Activity.

### Flow F: Create Draft Release With Assets

1. User opens Create tab.
2. User enters tag, title, and notes.
3. User selects draft state.
4. User adds assets and optional display labels.
5. User enables verify tag or selects target branch/commit.
6. User opens Review layer.
7. App shows exact command intent and side effects.
8. User confirms.
9. Backend runs `gh release create`.
10. Result layer shows release link, command summary, and next actions.

Acceptance:

- Invalid empty tag is blocked before command execution.
- Asset paths are validated for existence.
- Label syntax is constructed safely as `path#label`.
- Command execution is cancellable before launch.

### Flow G: Generate Release Notes

1. User selects generated notes mode.
2. User optionally enters notes to prepend.
3. User optionally enters notes start tag.
4. User reviews generated-notes command.
5. Backend runs `gh release create --generate-notes`.

Acceptance:

- UI explains that GitHub generates title unless title is provided.
- Generated notes mode cannot be combined with notes-from-tag mode.
- Notes start tag is only enabled when generated notes is selected.

### Flow H: Publish or Edit Draft

1. User selects draft release.
2. User opens Edit layer.
3. User modifies title, notes, prerelease, latest, or discussion category.
4. User selects Publish.
5. Review layer shows `--draft=false` intent.
6. Backend runs `gh release edit`.

Acceptance:

- Draft publish is a distinct primary action.
- Editing notes from file supports selected local file.
- Tag rename requires explicit warning and confirmation.

### Flow I: Manage Release Assets

1. User opens Assets tab or detail Assets layer.
2. User selects release tag.
3. User uploads files.
4. User chooses overwrite behavior.
5. User deletes incorrect asset after confirmation.

Acceptance:

- Upload uses `gh release upload`.
- `--clobber` is never implicit.
- Asset delete names both tag and asset in confirmation.

### Flow J: Download Release Assets or Source Archive

1. User opens Downloads tab.
2. User selects latest release or specific tag.
3. User chooses assets, patterns, archive format, destination directory, and conflict behavior.
4. Backend runs `gh release download`.
5. Activity shows downloaded files or command output.

Acceptance:

- Latest release downloads require either pattern or archive selection, matching CLI requirements.
- `--clobber` and `--skip-existing` are mutually exclusive.
- Single output file mode is only allowed for one asset result.

### Flow K: Delete Release or Asset

1. User opens Danger layer from release detail or asset row.
2. UI explains impact.
3. User types release tag or asset name.
4. UI enables final delete.
5. Backend passes `--yes` only after confirmation.

Acceptance:

- Delete release and cleanup tag are separate confirmations.
- Cleanup tag cannot be selected accidentally.
- Activity log records destructive operation metadata without storing secrets.

### Flow L: Actions Operations

1. User opens Actions.
2. User views workflows, recent runs, cache entries, and selected run details.
3. User watches a run, views logs, downloads artifacts, reruns failed jobs, cancels, deletes, enables/disables workflows, or dispatches a workflow with inputs.

Acceptance:

- `gh workflow list/view/run/enable/disable` and `gh run list/view/watch/rerun/cancel/delete/download` have guided paths.
- Workflow dispatch shows ref and inputs before execution.
- Run delete and cancel require confirmation.

### Flow M: Security and Configuration Operations

1. User opens Security.
2. User manages secrets, variables, SSH keys, GPG keys, deploy keys, and rulesets.
3. User opens Settings for auth, config, aliases, completion, and extensions.

Acceptance:

- Secret values and tokens are never displayed in Activity.
- Secret/variable set flows support body entry, env file selection, organization/environment/user scope, visibility, and selected repositories.
- Key delete, secret delete, variable delete, deploy-key delete, and cache delete require confirmation.

### Flow N: Advanced Command Runner

1. User opens Advanced.
2. User selects `gh api`, extension execution, codespace SSH/copy, or a raw command from the manifest.
3. UI shows argument tokens, supported flags, risk score, preview, output handling, and redaction policy.
4. User executes after review.

Acceptance:

- Advanced runner can execute any command in [gh-command-coverage.md](gh-command-coverage.md) that lacks a bespoke guided form.
- Shell interpretation is never used unless a `gh` command explicitly requires shell-like expansion and the UI warns the user.
- Sensitive output is redacted by default.

## 8. Backend Requirements

### Process Execution

- Invoke `gh` with argument arrays, for example `["release", "list", "--repo", repo, "--json", fields]`.
- Execute commands silently in the background by default.
- Never open a terminal window for guided or structured workflows.
- Never concatenate shell command strings.
- Capture stdout, stderr, exit code, start time, end time, duration, and cancellation status.
- Enforce per-command timeout with user-visible retry.
- Stream long-running output to Activity when available.
- Redact command output before display or persistence.

### Setup Engine

Required setup checks:

- operating system;
- CPU architecture;
- app write permissions;
- `gh` binary path and version;
- Git binary path and version;
- PATH visibility from the app process;
- supported installer or package manager availability;
- `gh auth status`;
- selected repository access.

Required setup actions:

- guided `gh` install;
- guided Git install;
- retry/recheck after install;
- guided `gh auth login`;
- manual fallback instructions;
- local setup diagnostic export.

### Command Builder Modules

Required builders:

- `buildCommandFromManifest(commandId, form)`
- `buildAdvancedCommand(form)`
- `buildAuthCommand(form)`
- `buildRepoCommand(form)`
- `buildPrCommand(form)`
- `buildIssueCommand(form)`
- `buildReleaseListCommand(options)`
- `buildReleaseViewCommand(options)`
- `buildReleaseCreateCommand(form)`
- `buildReleaseEditCommand(form)`
- `buildReleaseUploadCommand(form)`
- `buildReleaseDownloadCommand(form)`
- `buildReleaseDeleteCommand(form)`
- `buildReleaseDeleteAssetCommand(form)`
- `buildWorkflowCommand(form)`
- `buildRunCommand(form)`
- `buildSecretCommand(form)`
- `buildVariableCommand(form)`
- `buildCodespaceCommand(form)`
- `buildGistCommand(form)`
- `buildSearchCommand(form)`

Each builder must return:

- executable: `gh`
- args: string array
- redactedPreview: display-safe command preview
- riskLevel: `read`, `write`, or `destructive`
- validationWarnings: non-blocking warnings

### Data Models

Repository context:

```ts
type RepositoryContext = {
  host?: string;
  owner: string;
  name: string;
  display: string;
  source: "current-directory" | "manual" | "recent";
};
```

Release summary:

```ts
type ReleaseSummary = {
  tagName: string;
  title: string;
  isDraft: boolean;
  isPrerelease: boolean;
  isLatest?: boolean;
  publishedAt?: string;
  createdAt?: string;
  url?: string;
};
```

Command result:

```ts
type CommandResult = {
  commandId: string;
  argsPreview: string[];
  exitCode: number;
  stdout: string;
  stderr: string;
  startedAt: string;
  finishedAt: string;
  riskLevel: "read" | "write" | "destructive";
};
```

Command manifest entry:

```ts
type CommandManifestEntry = {
  id: string;
  command: string[];
  domain: string;
  coveragePath: "guided" | "structured-form" | "advanced-runner";
  riskLevel: "read" | "write" | "destructive" | "sensitive";
  supportsJson: boolean;
  requiresRepoContext: boolean;
  redactionRules: string[];
};
```

### Validation Rules

- Repository must match `[HOST/]OWNER/REPO` or be resolved from local git context.
- Command ID must exist in the maintained manifest before execution.
- Tag is required for create, edit, upload, release delete, and asset delete.
- Delete confirmations must match the target tag or asset name exactly.
- Generated notes and notes-from-tag are mutually exclusive.
- Notes string and notes file can both exist only when CLI behavior is intentionally supported and shown in review; otherwise prefer one notes source.
- Latest download without tag must include pattern or archive.
- Clobber and skip existing are mutually exclusive for downloads.
- Upload clobber requires confirmation.
- Asset files must exist before command execution.
- Output directory must exist or be user-created explicitly.
- File paths shown in UI should be normalized and shortened, but backend must use full paths.
- Secret, variable, token, and key values must be accepted through sensitive inputs and excluded from command previews.
- Commands that mutate repositories, projects, workflows, secrets, variables, keys, or codespaces must use review layers.

### Error Handling

Map common failures:

- `gh` missing: show install instructions and disable operations.
- Not authenticated: prompt user to run `gh auth login`.
- Repo not found or unauthorized: keep repository switcher focused with correction hint.
- Tag missing with verify tag: explain remote tag requirement.
- Asset duplicate without clobber: offer retry with overwrite.
- Invalid discussion category: keep field active and show GitHub response.
- Network/API failure: show retry and raw `gh` stderr in Activity.
- Cancellation: mark command as cancelled, not failed.
- Missing scopes: show required scope guidance and a `gh auth refresh` action.
- Interactive command requires terminal: show terminal consent layer or disable unsupported interactive mode.

## 9. Front-End Screen Details

### Setup Screen

Sections:

- System readiness.
- GitHub CLI setup.
- Git setup.
- Authentication.
- Repository connection.
- Troubleshooting details.

Primary actions:

- Install GitHub CLI.
- Install Git.
- Sign in to GitHub.
- Recheck.
- Continue with limited remote-only features when safe.

### Repository Tab

Sections:

- Current repository context.
- Manual repository entry.
- Recent repositories.
- Auth and CLI readiness.
- Default download directory.

Primary actions:

- Use current directory.
- Connect repository.
- Refresh status.

### Home Tab

Sections:

- Auth and account readiness.
- Selected repository status.
- Personal `gh status`.
- Assigned issues.
- Pull requests needing attention.
- Recent workflow failures.
- Latest release.
- Recent command activity.

### Releases Tab

Sections:

- Filter bar.
- Release table.
- Detail layer.
- Quick actions.

Columns:

- Status.
- Tag.
- Title.
- Published date.
- Latest marker.
- Asset count when known.
- Actions.

Quick actions:

- View.
- Edit.
- Upload assets.
- Download.
- Open on GitHub.

### Pull Requests Tab

Sections:

- Filter bar.
- Pull request table.
- Detail layer.
- Checks panel.
- Diff panel.
- Review and merge layers.

### Issues Tab

Sections:

- Issue table.
- Label table.
- Issue detail.
- Create/edit/comment forms.
- Transfer and danger layers.

### Actions Tab

Sections:

- Workflow table.
- Run table.
- Run detail and logs.
- Artifact downloads.
- Cache table.
- Dispatch workflow layer.

### Projects Tab

Sections:

- Organization selector.
- Project list.
- Project detail.
- Item table.
- Field table.
- Structured admin forms.

### Security Tab

Sections:

- Secrets.
- Variables.
- SSH keys.
- GPG keys.
- Deploy keys.
- Rulesets.

### Codespaces Tab

Sections:

- Codespace list.
- Detail and status.
- Logs.
- Ports.
- Lifecycle actions.
- Advanced SSH/copy actions.

### Gists Tab

Sections:

- Gist list.
- Gist detail.
- Create/edit forms.
- Clone and delete actions.

### Search Tab

Sections:

- Search type selector.
- Query builder.
- Filters.
- Results.
- Open in browser action.

### Advanced Tab

Sections:

- Command manifest browser.
- `gh api` builder.
- Argument-token builder.
- Redacted command preview.
- Output and formatting controls.
- Risk review.

### Create Tab

Sections:

- Identity: tag, title, target.
- State: draft, prerelease, latest.
- Notes: inline, file, generated, from tag.
- Assets: file list with labels.
- Collaboration: discussion category.
- Safety: verify tag.
- Review and create.

### Assets Tab

Sections:

- Release selector.
- Existing assets.
- Upload queue.
- Conflict handling.
- Asset danger actions.

### Downloads Tab

Sections:

- Release selector.
- Asset pattern filters.
- Archive selection.
- Destination.
- Conflict behavior.
- Download result.

### Activity Tab

Sections:

- Command history.
- Redacted command preview.
- friendly command summary.
- redacted stdout and stderr details.
- Duration and exit status.
- Copy diagnostics.

Activity retention:

- Keep current session command history.
- Do not store secrets.
- Mark destructive commands clearly.
- Do not show raw CLI output by default for successful commands.

### Settings Tab

Sections:

- `gh` binary path detection.
- Auth account and host controls.
- Re-run setup wizard.
- Alias manager.
- Config manager.
- Extension manager.
- Completion generator.
- Default repository behavior.
- Default download directory.
- Confirmations.
- Advanced command preview.

## 10. MVP Delivery Milestones

### Milestone 1: Local Setup, CLI Readiness, Manifest, and Repository Context

Deliver:

- First-run setup wizard.
- Missing dependency detection and guided install paths.
- Silent verification checks.
- `gh` detection.
- Git detection.
- Auth status check.
- Command manifest generated from `gh help reference` and checked into code.
- Repository switcher.
- Activity log foundation.

Done when:

- A novice user can get to authenticated Home without manually typing commands in normal supported environments.

### Milestone 2: Home, Repository, Pull Request, and Issue Browsers

Deliver:

- Home status.
- Repository list/detail.
- Pull request list/detail.
- Issue list/detail.
- Release list/detail.
- Browser open action.
- Filters and refresh.

Done when:

- User can inspect day-to-day GitHub work without running manual CLI commands.

### Milestone 3: Core Write Workflows

Deliver:

- Issue create/edit/comment/close.
- Pull request create/review/merge/comment/checkout.
- Create form.
- Notes modes.
- Draft/prerelease/latest controls.
- Review layer.
- Edit layer.

Done when:

- User can complete common issue, pull request, and release write workflows.

### Milestone 4: Actions, Assets, and Downloads

Deliver:

- Upload queue.
- Asset labels.
- Upload clobber confirmation.
- Asset delete confirmation.
- Workflow/run list, view, watch, rerun, cancel, download.
- Cache list/delete.

Done when:

- User can manage release assets and Actions diagnostics end to end.

### Milestone 5: Administration Surfaces

Deliver:

- Secrets and variables.
- SSH, GPG, and deploy keys.
- Rulesets.
- Labels.
- Projects and organizations.
- Codespaces.
- Gists.

Done when:

- User can perform operational administration without exposing secrets or bypassing confirmations.

### Milestone 6: Advanced Runner and Full Command Parity

Deliver:

- `gh api` builder.
- Alias/config/completion/extension forms.
- Codespace SSH/copy handling.
- Any-command manifest runner.
- Full command coverage test.

Done when:

- Every command in [gh-command-coverage.md](gh-command-coverage.md) is reachable through a guided workflow, structured form, or advanced runner.

## 11. Acceptance Criteria

- The app is documented and implemented as local-only, with no hosted command executor.
- Guided and structured workflows execute `gh` silently without opening terminal windows.
- First-run setup detects missing `gh`, Git, PATH visibility, auth state, and required runtime dependencies.
- First-run setup offers automated install or clear manual fallback with recheck.
- Novice users can complete normal setup without manually composing CLI commands.
- Every command reported by `gh help reference` has a documented and implemented UI path.
- Full coverage is validated by comparing the command manifest against `gh help reference` headings.
- All `gh release` commands listed in the command coverage matrix have a defined UI path.
- Every write or destructive operation has a review layer before execution.
- Destructive operations require typed confirmation.
- Backend command builders are unit-tested with representative flag combinations.
- No command builder uses shell string interpolation.
- The app works with explicit `--repo` context and current-directory repository context.
- Read operations show parsed results and retain raw output in Activity.
- Error states are actionable and tied to the relevant field or command.
- UI has root tabs, one-click home anchor, and in-context layers.
- Long content uses internal pane scrolling only where necessary.
- Keyboard navigation supports all critical flows.
- README and implementation docs list actual run, test, and validation commands once implementation exists.

## 12. Deferred Enhancements

- Release comparison across repositories.
- Semantic version suggestion and changelog linting.
- Git tag creation and push management outside `gh release`.
- CI artifact discovery and automatic asset attachment.
- Multi-account profile switching beyond what `gh` already supports.
- Release templates.
- Organization dashboard.
- Scheduled release publishing.
- Direct GitHub API fallback when `gh` is unavailable.
- Drag-and-drop workflow designer.
- Hosted collaboration mode.
- Remote workspace execution.

## 13. Product Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| `gh` output shape changes | Parsing failures | Prefer `--json` fields, keep raw output visible, and validate manifest against `gh help reference`. |
| User deletes release accidentally | Data loss | Typed confirmation and separate cleanup-tag confirmation. |
| Asset overwrite surprises user | Artifact loss | `--clobber` requires explicit toggle and review. |
| Auth or permission failures feel opaque | User blocked | Map common stderr cases to field-specific guidance. |
| Shell injection through repo or file fields | Security issue | Use subprocess argument arrays only. |
| UI hides advanced CLI capability | Power users blocked | Advanced sections expose less common flags without cluttering defaults. |
| Secrets or tokens leak into logs | Credential exposure | Sensitive inputs are write-only and Activity redacts previews/stdout/stderr. |
| Full CLI scope overwhelms users | Low usability | Use domain tabs, guided workflows for daily work, structured forms for admin tasks, and Advanced runner for expert tasks. |
| Setup fails on unsupported machines | User cannot start | Provide manual fallback, PATH repair guidance, recheck, and local diagnostic export. |
| Silent execution hides important detail | User distrust or debugging friction | Show friendly summaries by default and redacted raw output on demand. |
| A command accidentally runs remotely | Security and trust issue | Prohibit hosted executors and require local child process execution in backend architecture. |

## 14. Requirement Clarification Record

- MVP means a runnable local GitHub CLI management tool, not only a mockup.
- "Full extent of `gh cli`" now means every installed `gh` command reported by `gh help reference`, not only `gh release`.
- "Locally-ran app" means all command execution happens on the user's machine, with no hosted command executor or cloud relay.
- "Executes commands silently" means normal `gh` and approved read-only `git` commands run as background child processes with output captured into the app, not visible terminal windows.
- "cd" is a working-directory setting, not an executable command; shell built-ins and unrelated executables are rejected.
- "Seamless setup" means the app detects missing dependencies, offers guided installation, verifies results, and supports novice users who do not know CLI commands.
- "Clean front end" means operational, restrained, tabbed, and layered UI with low click depth and clear safeguards.
- "Very easy to use" means guided forms, default-safe controls, command previews, actionable errors, and no requirement to memorize flags.
