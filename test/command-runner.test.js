import test from "node:test";
import assert from "node:assert/strict";
import {
  buildGuidedArgs,
  parseArgsText,
  redactText,
  riskForArgs,
  validateCommandText,
  validateGhArgs,
  validateGitArgs,
  validateWorkingDirectory
} from "../src/command-runner.js";

test("parses quoted advanced arguments", () => {
  assert.deepEqual(parseArgsText("issue list --label \"good first issue\""), [
    "issue",
    "list",
    "--label",
    "good first issue"
  ]);
});

test("rejects commands outside gh help reference top-level set", () => {
  const result = validateGhArgs(["git", "status"]);
  assert.equal(result.ok, false);
  assert.match(result.errors[0], /Unsupported gh command/);
});

test("allows full gh commands through the desktop command policy", () => {
  const result = validateCommandText("gh repo view cli/cli --json name");
  assert.equal(result.ok, true);
  assert.equal(result.executable, "gh");
  assert.deepEqual(result.args, ["repo", "view", "cli/cli", "--json", "name"]);
});

test("allows approved read-only git commands", () => {
  const result = validateGitArgs(["git", "status", "--short"]);
  assert.equal(result.ok, true);
  assert.equal(result.executable, "git");
  assert.deepEqual(result.args, ["status", "--short"]);
});

test("rejects mutating git commands", () => {
  const result = validateCommandText("git checkout main");
  assert.equal(result.ok, false);
  assert.match(result.errors[0], /read-only git commands/);
});

test("rejects cd as a command and points to working directory", () => {
  const result = validateCommandText("cd /tmp");
  assert.equal(result.ok, false);
  assert.match(result.errors[0], /Working Directory/);
});

test("rejects unrelated executables", () => {
  const result = validateCommandText("bash -lc whoami");
  assert.equal(result.ok, false);
  assert.match(result.errors[0], /Only gh and approved read-only git commands/);
});

test("validates existing working directory", () => {
  const result = validateWorkingDirectory(".");
  assert.equal(result.ok, true);
});

test("classifies destructive and sensitive commands", () => {
  assert.equal(riskForArgs(["repo", "delete", "owner/name"]), "destructive");
  assert.equal(riskForArgs(["secret", "set", "TOKEN"]), "sensitive");
  assert.equal(riskForArgs(["pr", "list"]), "read");
});

test("builds repo view with repository as positional argument", () => {
  const result = buildGuidedArgs({ commandId: "repo-view", repo: "cli/cli" });
  assert.equal(result.ok, true);
  assert.deepEqual(result.args, ["repo", "view", "cli/cli"]);
});

test("builds repo-scoped release list with --repo flag", () => {
  const result = buildGuidedArgs({ commandId: "release-list", repo: "cli/cli" });
  assert.equal(result.ok, true);
  assert.deepEqual(result.args, ["release", "list", "--limit", "30", "--repo", "cli/cli"]);
});

test("redacts common GitHub token shapes", () => {
  assert.equal(redactText("token ghp_abc123XYZ"), "token [redacted-token]");
});
