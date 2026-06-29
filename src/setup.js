import { platform, arch } from "node:process";
import { runProcess } from "./command-runner.js";

export function buildAuthLoginArgs() {
  return ["auth", "login", "--web", "--git-protocol", "https", "--hostname", "github.com"];
}

function installHintForGh() {
  if (platform === "win32") {
    return {
      primary: "Install GitHub CLI with winget",
      command: "winget install --id GitHub.cli",
      fallback: "Download GitHub CLI from https://cli.github.com/"
    };
  }
  if (platform === "darwin") {
    return {
      primary: "Install GitHub CLI with Homebrew",
      command: "brew install gh",
      fallback: "Download GitHub CLI from https://cli.github.com/"
    };
  }
  return {
    primary: "Install GitHub CLI with your Linux package manager",
    command: "See https://github.com/cli/cli/blob/trunk/docs/install_linux.md",
    fallback: "Use your distribution package manager, then recheck."
  };
}

function installHintForGit() {
  if (platform === "win32") {
    return {
      primary: "Install Git for Windows",
      command: "winget install --id Git.Git",
      fallback: "Download Git from https://git-scm.com/downloads"
    };
  }
  if (platform === "darwin") {
    return {
      primary: "Install Git developer tools or Homebrew Git",
      command: "xcode-select --install",
      fallback: "brew install git"
    };
  }
  return {
    primary: "Install Git with your Linux package manager",
    command: "sudo apt install git",
    fallback: "Use the package manager for your distribution."
  };
}

async function checkBinary(label, executable, args) {
  const result = await runProcess(executable, args, { timeoutMs: 8000 });
  return {
    label,
    executable,
    ready: result.exitCode === 0,
    summary: result.exitCode === 0 ? result.stdout.trim().split("\n")[0] : result.stderr.trim(),
    exitCode: result.exitCode
  };
}

export async function getSetupStatus() {
  const [gh, git, auth] = await Promise.all([
    checkBinary("GitHub CLI", "gh", ["--version"]),
    checkBinary("Git", "git", ["--version"]),
    checkBinary("GitHub authentication", "gh", ["auth", "status"])
  ]);

  return {
    system: {
      platform,
      arch,
      node: process.version
    },
    checks: {
      gh: {
        ...gh,
        install: installHintForGh()
      },
      git: {
        ...git,
        install: installHintForGit()
      },
      auth: {
        ...auth,
        ready: gh.ready && auth.ready,
        install: {
          primary: "Sign in to GitHub",
          command: "gh auth login",
          fallback: "Open Settings after GitHub CLI is installed."
        }
      }
    }
  };
}

export async function startAuthFlow() {
  const result = await runProcess("gh", buildAuthLoginArgs(), { timeoutMs: 300000 });
  const status = await getSetupStatus();
  return {
    ok: result.exitCode === 0 && status.checks.auth.ready,
    message: status.checks.auth.ready
      ? "GitHub authentication is ready."
      : "Authentication did not complete. Start sign in again or run setup checks.",
    result,
    status
  };
}
