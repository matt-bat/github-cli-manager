export const TOP_LEVEL_COMMANDS = new Set([
  "alias",
  "api",
  "auth",
  "browse",
  "cache",
  "co",
  "codespace",
  "completion",
  "config",
  "extension",
  "gist",
  "gpg-key",
  "issue",
  "label",
  "org",
  "pr",
  "project",
  "release",
  "repo",
  "ruleset",
  "run",
  "search",
  "secret",
  "ssh-key",
  "status",
  "variable",
  "workflow"
]);

export const COMMAND_DOMAINS = {
  alias: "Settings",
  api: "Advanced",
  auth: "Settings",
  browse: "Home",
  cache: "Actions",
  co: "Pull Requests",
  codespace: "Codespaces",
  completion: "Settings",
  config: "Settings",
  extension: "Settings",
  gist: "Gists",
  "gpg-key": "Security",
  issue: "Issues",
  label: "Issues",
  org: "Projects",
  pr: "Pull Requests",
  project: "Projects",
  release: "Releases",
  repo: "Repository",
  ruleset: "Security",
  run: "Actions",
  search: "Search",
  secret: "Security",
  "ssh-key": "Security",
  status: "Home",
  variable: "Security",
  workflow: "Actions"
};

export const GUIDED_COMMANDS = [
  {
    id: "status",
    label: "Personal status",
    description: "Show pull requests, issues, and notifications across repositories.",
    args: ["status"],
    domain: "Home",
    riskLevel: "read"
  },
  {
    id: "repo-view",
    label: "Repository details",
    description: "View the selected repository.",
    args: ["repo", "view"],
    domain: "Repository",
    riskLevel: "read",
    repoMode: "positional"
  },
  {
    id: "pr-list",
    label: "Pull request list",
    description: "List open pull requests for the selected repository.",
    args: ["pr", "list", "--limit", "30"],
    domain: "Pull Requests",
    riskLevel: "read",
    repoMode: "flag"
  },
  {
    id: "issue-list",
    label: "Issue list",
    description: "List open issues for the selected repository.",
    args: ["issue", "list", "--limit", "30"],
    domain: "Issues",
    riskLevel: "read",
    repoMode: "flag"
  },
  {
    id: "release-list",
    label: "Release list",
    description: "List recent releases for the selected repository.",
    args: ["release", "list", "--limit", "30"],
    domain: "Releases",
    riskLevel: "read",
    repoMode: "flag"
  },
  {
    id: "workflow-list",
    label: "Workflow list",
    description: "List workflows for the selected repository.",
    args: ["workflow", "list"],
    domain: "Actions",
    riskLevel: "read",
    repoMode: "flag"
  },
  {
    id: "secret-list",
    label: "Secret list",
    description: "List repository secret names and metadata only.",
    args: ["secret", "list"],
    domain: "Security",
    riskLevel: "sensitive",
    repoMode: "flag"
  }
];

export function getGuidedCommand(id) {
  return GUIDED_COMMANDS.find((command) => command.id === id);
}
