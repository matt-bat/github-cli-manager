# GitHub CLI Command Coverage

Last updated: 2026-06-28

This document maps the installed `gh version 2.45.0` command surface to MVP UI coverage. The app must support every command through one of three paths:

- Guided workflow: dedicated workflow with domain-specific validation and layered UI.
- Structured form: command-specific form generated from the maintained command manifest.
- Advanced runner: expert command builder with argument tokens, preview, risk scoring, confirmation gates, and Activity output.

## Top-Level Command Domains

| Domain | Commands | MVP Surface | Coverage Path |
|---|---|---|---|
| Authentication | `auth` | Settings and Home readiness | Guided workflow |
| Repository navigation | `browse`, `repo`, `status` | Home and Repository | Guided workflow |
| Pull requests | `pr`, `co` | Pull Requests | Guided workflow |
| Issues and labels | `issue`, `label` | Issues | Guided workflow |
| Releases | `release` | Releases | Guided workflow |
| GitHub Actions | `workflow`, `run`, `cache` | Actions | Guided workflow |
| Projects and organizations | `project`, `org` | Projects | Guided workflow plus structured forms |
| Codespaces | `codespace` | Codespaces | Guided workflow plus advanced runner for SSH/copy |
| Gists | `gist` | Gists | Guided workflow |
| Secrets and variables | `secret`, `variable` | Security | Guided workflow with write-only sensitive inputs |
| Keys and rulesets | `ssh-key`, `gpg-key`, `repo deploy-key`, `ruleset` | Security | Guided workflow |
| Search | `search` | Search | Guided workflow |
| API | `api` | Advanced | Advanced runner |
| Aliases, config, completion, extensions | `alias`, `config`, `completion`, `extension` | Settings and Advanced | Structured forms |

## Coverage Rules

- Every command execution goes through a backend command builder that returns `executable`, `args`, `redactedPreview`, `riskLevel`, and validation output.
- Read commands may run from list/detail surfaces after context validation.
- Write commands require a Review layer.
- Destructive commands require typed confirmation.
- Commands that can expose credentials, tokens, keys, secrets, or environment values must redact stdout, stderr, previews, and Activity records.
- Commands with interactive terminal requirements must either use non-interactive flags or open a controlled terminal layer with clear user consent.
- Commands that open browsers must show the destination URL first when possible.

## Command Inventory

| Command | MVP Surface | Path | Notes |
|---|---|---|---|
| `gh alias delete {<alias> \| --all}` | Settings | Structured form | `--all` requires typed confirmation. |
| `gh alias import [<filename> \| -]` | Settings | Structured form | File picker; `--clobber` warning. |
| `gh alias list` | Settings | Guided workflow | List aliases. |
| `gh alias set <alias> <expansion>` | Settings | Structured form | Shell aliases require extra warning. |
| `gh api <endpoint>` | Advanced | Advanced runner | Support method, headers, fields, pagination, previews, cache, jq, template, verbose redaction. |
| `gh auth login` | Settings | Guided workflow | Launch controlled login flow; warn for token/plaintext storage. |
| `gh auth logout` | Settings | Guided workflow | Confirmation required. |
| `gh auth refresh` | Settings | Guided workflow | Scope add/remove controls. |
| `gh auth setup-git` | Settings | Guided workflow | Host selector; force warning. |
| `gh auth status` | Home | Guided workflow | Readiness check. |
| `gh auth switch` | Settings | Guided workflow | Account picker when available. |
| `gh auth token` | Settings | Advanced runner | Disabled by default; token output redacted and requires explicit reveal. |
| `gh browse` | Home and domain detail pages | Guided workflow | Open repository, issue, pull request, release, wiki, settings, projects, branch, commit, or URL preview. |
| `gh cache delete` | Actions | Guided workflow | Delete one cache or all; destructive confirmation. |
| `gh cache list` | Actions | Guided workflow | Cache table with ref, key, size, sort, filters. |
| `gh co` | Pull Requests | Guided workflow | Alias for PR checkout. |
| `gh codespace code` | Codespaces | Guided workflow | Open selected codespace in VS Code or web. |
| `gh codespace cp` | Codespaces | Advanced runner | File transfer requires source/destination validation. |
| `gh codespace create` | Codespaces | Guided workflow | Repo, branch, machine, location, timeout, retention, devcontainer. |
| `gh codespace delete` | Codespaces | Guided workflow | Destructive; support filters, age cleanup, force warning. |
| `gh codespace edit` | Codespaces | Structured form | Display name and machine edits. |
| `gh codespace jupyter` | Codespaces | Guided workflow | Open JupyterLab for selected codespace. |
| `gh codespace list` | Codespaces | Guided workflow | Codespace table with repo/org/user filters. |
| `gh codespace logs` | Codespaces | Guided workflow | Log viewer with follow mode. |
| `gh codespace ports` | Codespaces | Guided workflow | Ports list. |
| `gh codespace ports forward` | Codespaces | Structured form | Remote/local port pair validation. |
| `gh codespace ports visibility` | Codespaces | Structured form | Visibility segmented control. |
| `gh codespace rebuild` | Codespaces | Guided workflow | Full rebuild warning. |
| `gh codespace ssh` | Codespaces | Advanced runner | Terminal layer; command and SSH flags preview. |
| `gh codespace stop` | Codespaces | Guided workflow | Stop selected codespace. |
| `gh codespace view` | Codespaces | Guided workflow | Detail layer. |
| `gh completion -s <shell>` | Settings | Structured form | Generate and copy completion script. |
| `gh config clear-cache` | Settings | Structured form | Confirmation. |
| `gh config get <key>` | Settings | Structured form | Host selector. |
| `gh config list` | Settings | Guided workflow | Config table. |
| `gh config set <key> <value>` | Settings | Structured form | Warn for sensitive values. |
| `gh extension browse` | Settings | Structured form | TUI/browser-like command; may require terminal layer. |
| `gh extension create` | Settings | Structured form | Scaffold extension locally. |
| `gh extension exec <name>` | Advanced | Advanced runner | Extension command passthrough with preview. |
| `gh extension install <repository>` | Settings | Structured form | Force and pin controls. |
| `gh extension list` | Settings | Guided workflow | Extension table. |
| `gh extension remove <name>` | Settings | Structured form | Confirmation. |
| `gh extension search` | Settings | Guided workflow | Search table with filters. |
| `gh extension upgrade {<name> \| --all}` | Settings | Structured form | Dry-run first; `--all` confirmation. |
| `gh gist clone` | Gists | Structured form | Directory picker and Git flags. |
| `gh gist create` | Gists | Guided workflow | File picker or stdin body, public/secret state, browser action. |
| `gh gist delete` | Gists | Guided workflow | Destructive confirmation. |
| `gh gist edit` | Gists | Guided workflow | File add/remove/edit form. |
| `gh gist list` | Gists | Guided workflow | List with public/secret filters. |
| `gh gist rename` | Gists | Structured form | Filename validation. |
| `gh gist view` | Gists | Guided workflow | Rendered/raw/file list detail. |
| `gh gpg-key add` | Security | Guided workflow | Key file picker and title. |
| `gh gpg-key delete` | Security | Guided workflow | Destructive confirmation. |
| `gh gpg-key list` | Security | Guided workflow | Key table. |
| `gh issue close` | Issues | Guided workflow | Reason selector and optional comment. |
| `gh issue comment` | Issues | Guided workflow | Markdown editor; edit-last option. |
| `gh issue create` | Issues | Guided workflow | Title, body, labels, assignees, milestone, project, template. |
| `gh issue delete` | Issues | Guided workflow | Destructive confirmation. |
| `gh issue develop` | Issues | Structured form | Branch creation/list/checkout controls. |
| `gh issue edit` | Issues | Guided workflow | Bulk edit metadata. |
| `gh issue list` | Issues | Guided workflow | Filterable issue table. |
| `gh issue lock` | Issues | Guided workflow | Reason selector and confirmation. |
| `gh issue pin` | Issues | Guided workflow | Pin action. |
| `gh issue reopen` | Issues | Guided workflow | Optional comment. |
| `gh issue status` | Home and Issues | Guided workflow | Personal issue status. |
| `gh issue transfer` | Issues | Structured form | Destination repository validation and confirmation. |
| `gh issue unlock` | Issues | Guided workflow | Confirmation. |
| `gh issue unpin` | Issues | Guided workflow | Confirmation. |
| `gh issue view` | Issues | Guided workflow | Detail layer. |
| `gh label clone` | Issues | Structured form | Source repo and force confirmation. |
| `gh label create` | Issues | Guided workflow | Name, color, description. |
| `gh label delete` | Issues | Guided workflow | Destructive confirmation. |
| `gh label edit` | Issues | Guided workflow | Rename/color/description. |
| `gh label list` | Issues | Guided workflow | Label table. |
| `gh org list` | Projects | Guided workflow | Organization list. |
| `gh pr checkout` | Pull Requests | Guided workflow | Checkout selected PR; branch/detached/recurse controls. |
| `gh pr checks` | Pull Requests | Guided workflow | Checks panel with watch option. |
| `gh pr close` | Pull Requests | Guided workflow | Comment and delete-branch option with confirmation. |
| `gh pr comment` | Pull Requests | Guided workflow | Markdown editor. |
| `gh pr create` | Pull Requests | Guided workflow | Title, body, base, head, draft, reviewers, labels, projects, milestones. |
| `gh pr diff` | Pull Requests | Guided workflow | Diff viewer or patch output. |
| `gh pr edit` | Pull Requests | Guided workflow | Metadata editor. |
| `gh pr list` | Pull Requests | Guided workflow | Filterable PR table. |
| `gh pr lock` | Pull Requests | Guided workflow | Reason selector and confirmation. |
| `gh pr merge` | Pull Requests | Guided workflow | Merge method, auto-merge, admin, delete branch, match head SHA. |
| `gh pr ready` | Pull Requests | Guided workflow | Mark ready for review. |
| `gh pr reopen` | Pull Requests | Guided workflow | Confirmation. |
| `gh pr review` | Pull Requests | Guided workflow | Approve, request changes, comment, body editor. |
| `gh pr status` | Home and Pull Requests | Guided workflow | Personal PR status. |
| `gh pr unlock` | Pull Requests | Guided workflow | Confirmation. |
| `gh pr view` | Pull Requests | Guided workflow | Detail layer. |
| `gh project close` | Projects | Structured form | Confirmation. |
| `gh project copy` | Projects | Structured form | Owner/source controls. |
| `gh project create` | Projects | Guided workflow | Owner, title, format. |
| `gh project delete` | Projects | Structured form | Destructive confirmation. |
| `gh project edit` | Projects | Structured form | Metadata form. |
| `gh project field-create` | Projects | Structured form | Field type and options. |
| `gh project field-delete` | Projects | Structured form | Destructive confirmation. |
| `gh project field-list` | Projects | Guided workflow | Field table. |
| `gh project item-add` | Projects | Guided workflow | Add issue/PR/content by URL. |
| `gh project item-archive` | Projects | Structured form | Confirmation. |
| `gh project item-create` | Projects | Guided workflow | Draft item creation. |
| `gh project item-delete` | Projects | Structured form | Destructive confirmation. |
| `gh project item-edit` | Projects | Structured form | Field value editor. |
| `gh project item-list` | Projects | Guided workflow | Project board/table. |
| `gh project link` | Projects | Structured form | Link repo/org. |
| `gh project list` | Projects | Guided workflow | Project list. |
| `gh project mark-template` | Projects | Structured form | Confirmation. |
| `gh project unlink` | Projects | Structured form | Confirmation. |
| `gh project view` | Projects | Guided workflow | Project detail. |
| `gh release create` | Releases | Guided workflow | See detailed release matrix in `mvp-spec.md`. |
| `gh release delete` | Releases | Guided workflow | Typed confirmation and cleanup-tag warning. |
| `gh release delete-asset` | Releases | Guided workflow | Asset confirmation. |
| `gh release download` | Releases | Guided workflow | Asset/archive download. |
| `gh release edit` | Releases | Guided workflow | Edit/publish draft. |
| `gh release list` | Releases | Guided workflow | Release table. |
| `gh release upload` | Releases | Guided workflow | Asset upload. |
| `gh release view` | Releases | Guided workflow | Release detail. |
| `gh repo archive` | Repository | Guided workflow | Archive confirmation. |
| `gh repo clone` | Repository | Structured form | Directory picker and Git flags. |
| `gh repo create` | Repository | Guided workflow | Owner, visibility, template, source, remote, clone. |
| `gh repo delete` | Repository | Guided workflow | Typed repository confirmation. |
| `gh repo deploy-key add` | Security | Guided workflow | Key file picker, title, read/write toggle. |
| `gh repo deploy-key delete` | Security | Guided workflow | Confirmation. |
| `gh repo deploy-key list` | Security | Guided workflow | Deploy key table. |
| `gh repo edit` | Repository | Guided workflow | Description, homepage, visibility, features, default branch. |
| `gh repo fork` | Repository | Structured form | Owner, clone, remote controls. |
| `gh repo list` | Repository | Guided workflow | Owner repo table. |
| `gh repo rename` | Repository | Guided workflow | Typed confirmation. |
| `gh repo set-default` | Repository | Structured form | Context setter. |
| `gh repo sync` | Repository | Structured form | Force hard reset warning. |
| `gh repo unarchive` | Repository | Guided workflow | Confirmation. |
| `gh repo view` | Repository | Guided workflow | Repository detail. |
| `gh ruleset check` | Security | Guided workflow | Branch rules preview. |
| `gh ruleset list` | Security | Guided workflow | Ruleset table. |
| `gh ruleset view` | Security | Guided workflow | Ruleset detail. |
| `gh run cancel` | Actions | Guided workflow | Confirmation. |
| `gh run delete` | Actions | Guided workflow | Destructive confirmation. |
| `gh run download` | Actions | Guided workflow | Artifact download. |
| `gh run list` | Actions | Guided workflow | Workflow run table. |
| `gh run rerun` | Actions | Guided workflow | Failed/job/debug controls. |
| `gh run view` | Actions | Guided workflow | Run detail, logs, failed logs. |
| `gh run watch` | Actions | Guided workflow | Live watcher. |
| `gh search code` | Search | Guided workflow | Search builder with filters. |
| `gh search commits` | Search | Guided workflow | Commit search filters. |
| `gh search issues` | Search | Guided workflow | Issue search filters. |
| `gh search prs` | Search | Guided workflow | Pull request search filters. |
| `gh search repos` | Search | Guided workflow | Repository search filters. |
| `gh secret delete` | Security | Guided workflow | Destructive confirmation. |
| `gh secret list` | Security | Guided workflow | Secret metadata only. |
| `gh secret set` | Security | Guided workflow | Write-only value, env file picker, visibility/repo access. |
| `gh ssh-key add` | Security | Guided workflow | Key file picker, title, type. |
| `gh ssh-key delete` | Security | Guided workflow | Confirmation. |
| `gh ssh-key list` | Security | Guided workflow | SSH key table. |
| `gh status` | Home | Guided workflow | Cross-repository personal status. |
| `gh variable delete` | Security | Guided workflow | Confirmation. |
| `gh variable list` | Security | Guided workflow | Variable table. |
| `gh variable set` | Security | Guided workflow | Value editor, env file picker, visibility/repo access. |
| `gh workflow disable` | Actions | Guided workflow | Confirmation. |
| `gh workflow enable` | Actions | Guided workflow | Enable action. |
| `gh workflow list` | Actions | Guided workflow | Workflow table. |
| `gh workflow run` | Actions | Guided workflow | Dispatch form with ref and inputs. |
| `gh workflow view` | Actions | Guided workflow | Workflow detail and YAML view. |

## MVP Priority Bands

### Band 1: Core Daily Work

- Home readiness, auth status, repository context, status.
- Repository list/view/create/edit.
- Pull request list/view/create/review/merge/checks/checkout.
- Issue list/view/create/comment/edit/close/reopen.
- Release list/view/create/edit/upload/download/delete.
- Workflow/run list/view/watch/rerun/download.

### Band 2: Operational Administration

- Secrets, variables, keys, deploy keys.
- Labels, rulesets, cache.
- Projects and organizations.
- Codespaces and gists.

### Band 3: Expert Surface

- `gh api`.
- Extensions and aliases.
- Config and completion.
- Codespace SSH/copy and extension exec.

Band 3 is still in MVP scope, but it may use structured forms or the advanced runner rather than bespoke workflows.
