import { spawn } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { COMMAND_DOMAINS, TOP_LEVEL_COMMANDS, getGuidedCommand } from "./command-manifest.js";

const ALLOWED_EXECUTABLES = new Set(["gh", "git"]);
const SAFE_GIT_SUBCOMMANDS = new Set([
  "status",
  "branch",
  "remote",
  "log",
  "show",
  "diff",
  "rev-parse",
  "describe",
  "tag",
  "ls-files"
]);

const DESTRUCTIVE_PATTERNS = [
  ["release", "delete"],
  ["release", "delete-asset"],
  ["repo", "delete"],
  ["issue", "delete"],
  ["pr", "close"],
  ["run", "delete"],
  ["run", "cancel"],
  ["cache", "delete"],
  ["secret", "delete"],
  ["variable", "delete"],
  ["ssh-key", "delete"],
  ["gpg-key", "delete"],
  ["codespace", "delete"],
  ["project", "delete"],
  ["label", "delete"],
  ["alias", "delete"],
  ["extension", "remove"],
  ["auth", "logout"]
];

const WRITE_COMMANDS = new Set([
  "create",
  "edit",
  "set",
  "add",
  "upload",
  "download",
  "merge",
  "review",
  "comment",
  "reopen",
  "close",
  "enable",
  "disable",
  "run",
  "rerun",
  "install",
  "upgrade",
  "sync",
  "archive",
  "unarchive",
  "rename",
  "fork",
  "clone",
  "checkout",
  "ready",
  "refresh",
  "login",
  "setup-git",
  "switch"
]);

const SENSITIVE_PATTERNS = [
  ["auth", "token"],
  ["secret", "set"],
  ["variable", "set"],
  ["api"]
];

export function parseArgsText(text) {
  if (!text || !text.trim()) {
    return [];
  }
  const matches = text.match(/"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'|\S+/g) ?? [];
  return matches.map((part) => {
    if ((part.startsWith("\"") && part.endsWith("\"")) || (part.startsWith("'") && part.endsWith("'"))) {
      return part.slice(1, -1);
    }
    return part;
  });
}

export function redactText(value) {
  if (!value) {
    return "";
  }
  return String(value)
    .replace(/gho_[A-Za-z0-9_]+/g, "[redacted-token]")
    .replace(/ghp_[A-Za-z0-9_]+/g, "[redacted-token]")
    .replace(/github_pat_[A-Za-z0-9_]+/g, "[redacted-token]")
    .replace(/(--body\s+)(\S+)/g, "$1[redacted]")
    .replace(/(Authorization:\s*token\s+)(\S+)/gi, "$1[redacted]");
}

export function riskForArgs(args) {
  const [first, second] = args;
  if (SENSITIVE_PATTERNS.some((pattern) => pattern.every((value, index) => args[index] === value))) {
    return "sensitive";
  }
  if (DESTRUCTIVE_PATTERNS.some((pattern) => pattern.every((value, index) => args[index] === value))) {
    return "destructive";
  }
  if (WRITE_COMMANDS.has(second) || WRITE_COMMANDS.has(first)) {
    return "write";
  }
  return "read";
}

export function validateWorkingDirectory(cwd) {
  if (!cwd) {
    return { ok: true, cwd: undefined };
  }
  const value = String(cwd).trim();
  if (!value) {
    return { ok: true, cwd: undefined };
  }
  if (!existsSync(value)) {
    return { ok: false, error: "Working directory does not exist." };
  }
  if (!statSync(value).isDirectory()) {
    return { ok: false, error: "Working directory must be a folder." };
  }
  return { ok: true, cwd: value };
}

export function validateGhArgs(args, options = {}) {
  const normalized = Array.isArray(args) ? args.map((arg) => String(arg).trim()).filter(Boolean) : [];
  if (normalized.length === 0) {
    return { ok: false, errors: ["Choose a gh command before running."], args: [] };
  }
  if (normalized[0] === "gh") {
    normalized.shift();
  }
  if (!TOP_LEVEL_COMMANDS.has(normalized[0])) {
    return {
      ok: false,
      errors: [`Unsupported gh command "${normalized[0]}". Use one of the commands from gh help reference.`],
      args: normalized
    };
  }
  if (normalized.some((arg) => arg.includes("\0"))) {
    return { ok: false, errors: ["Command arguments cannot contain null bytes."], args: normalized };
  }

  const riskLevel = riskForArgs(normalized);
  const warnings = [];
  if (riskLevel === "sensitive") {
    warnings.push("This command may expose secrets, tokens, or private API output. Output will be redacted.");
  }
  if (riskLevel === "destructive") {
    warnings.push("This command can delete or cancel remote GitHub resources.");
  }
  if ((riskLevel === "write" || riskLevel === "destructive") && !options.confirmed) {
    warnings.push("Review required before execution.");
  }

  return {
    ok: true,
    errors: [],
    warnings,
    args: normalized,
    riskLevel,
    domain: COMMAND_DOMAINS[normalized[0]] ?? "Advanced",
    redactedPreview: ["gh", ...normalized].map(redactText)
  };
}

export function validateGitArgs(args) {
  const normalized = Array.isArray(args) ? args.map((arg) => String(arg).trim()).filter(Boolean) : [];
  if (normalized[0] === "git") {
    normalized.shift();
  }
  if (normalized.length === 0) {
    return { ok: false, errors: ["Choose a git command before running."], args: [] };
  }
  if (!SAFE_GIT_SUBCOMMANDS.has(normalized[0])) {
    return {
      ok: false,
      errors: [`Only read-only git commands are allowed here. "${normalized[0]}" is not allowed.`],
      args: normalized
    };
  }
  if (normalized.some((arg) => arg.includes("\0"))) {
    return { ok: false, errors: ["Command arguments cannot contain null bytes."], args: normalized };
  }
  return {
    ok: true,
    errors: [],
    warnings: [],
    executable: "git",
    args: normalized,
    riskLevel: "read",
    domain: "Repository",
    redactedPreview: ["git", ...normalized].map(redactText)
  };
}

export function validateCommandText(text, options = {}) {
  const parts = parseArgsText(text);
  if (parts.length === 0) {
    return { ok: false, errors: ["Choose a command before running."], args: [] };
  }
  const executable = parts[0];
  if (executable === "cd") {
    return {
      ok: false,
      errors: ["Use the Working Directory field instead of running cd. The app does not execute shell built-ins."],
      args: parts
    };
  }
  if (!ALLOWED_EXECUTABLES.has(executable)) {
    return {
      ok: false,
      errors: [`Only gh and approved read-only git commands can run. "${executable}" is not allowed.`],
      args: parts
    };
  }
  if (executable === "git") {
    return validateGitArgs(parts);
  }
  const result = validateGhArgs(parts, options);
  return result.ok ? { ...result, executable: "gh" } : result;
}

export function buildGuidedArgs({ commandId, repo }) {
  const command = getGuidedCommand(commandId);
  if (!command) {
    return { ok: false, errors: ["Unknown guided command."], args: [] };
  }
  const args = [...command.args];
  if (command.repoMode === "flag" && repo) {
    args.push("--repo", repo);
  } else if (command.repoMode === "positional" && repo) {
    args.push(repo);
  }
  const result = validateGhArgs(args, { confirmed: true });
  return result.ok ? { ...result, executable: "gh" } : result;
}

export function runProcess(executable, args, options = {}) {
  const timeoutMs = options.timeoutMs ?? 30000;
  return new Promise((resolve) => {
    const startedAt = new Date();
    const child = spawn(executable, args, {
      windowsHide: true,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
      cwd: options.cwd
    });

    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({
        exitCode: 127,
        stdout: "",
        stderr: error.message,
        startedAt: startedAt.toISOString(),
        finishedAt: new Date().toISOString(),
        timedOut: false
      });
    });
    child.on("close", (exitCode, signal) => {
      clearTimeout(timer);
      resolve({
        exitCode: exitCode ?? (signal ? 124 : 1),
        stdout: redactText(stdout),
        stderr: redactText(stderr),
        startedAt: startedAt.toISOString(),
        finishedAt: new Date().toISOString(),
        timedOut: signal === "SIGTERM"
      });
    });
  });
}

export async function executeGh(args, options = {}) {
  const cwdCheck = validateWorkingDirectory(options.cwd);
  if (!cwdCheck.ok) {
    return { ok: false, validation: { ok: false, errors: [cwdCheck.error], args: [] } };
  }
  const validation = validateGhArgs(args, options);
  if (!validation.ok) {
    return { ok: false, validation };
  }
  const result = await runProcess("gh", validation.args, { ...options, cwd: cwdCheck.cwd });
  return {
    ok: result.exitCode === 0,
    validation,
    result
  };
}

export async function executeCommandText(text, options = {}) {
  const cwdCheck = validateWorkingDirectory(options.cwd);
  if (!cwdCheck.ok) {
    return { ok: false, validation: { ok: false, errors: [cwdCheck.error], args: [] } };
  }
  const validation = validateCommandText(text, options);
  if (!validation.ok) {
    return { ok: false, validation };
  }
  const result = await runProcess(validation.executable, validation.args, {
    ...options,
    cwd: cwdCheck.cwd
  });
  return {
    ok: result.exitCode === 0,
    validation,
    result
  };
}
