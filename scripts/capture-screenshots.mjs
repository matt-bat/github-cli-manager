import { chromium } from "playwright";
import path from "node:path";

const outputDir = path.resolve("docs/screenshots");
const appUrl = `file://${path.resolve("public/index.html")}`;

async function installDesktopBridge(page) {
  await page.addInitScript(() => {
    let authenticated = false;
    const setupStatus = () => ({
      checks: {
        gh: { label: "GitHub CLI", ready: true, summary: "gh version 2.x", install: { primary: "Install GitHub CLI", command: "gh --version" } },
        git: { label: "Git", ready: true, summary: "git version 2.x", install: { primary: "Install Git", command: "git --version" } },
        auth: {
          label: "GitHub authentication",
          ready: authenticated,
          summary: authenticated ? "Logged in to github.com." : "You are not logged in.",
          install: { primary: "Sign in to GitHub", command: "gh auth login" }
        }
      }
    });
    window.githubCliManager = {
      getSetupStatus: async () => setupStatus(),
      startAuthFlow: async () => {
        authenticated = true;
        return { ok: true, message: "GitHub authentication is ready.", status: setupStatus(), result: { exitCode: 0, stdout: "", stderr: "" } };
      },
      listCommands: async () => ({
        guided: [
          { id: "repo-view", label: "Open repository summary", description: "Check repository metadata and visibility.", riskLevel: "read", domain: "Repository" },
          { id: "pr-list", label: "Review pull requests", description: "List open pull requests for triage.", riskLevel: "read", domain: "Pull Requests" },
          { id: "issue-list", label: "Review issues", description: "List open issues for planning.", riskLevel: "read", domain: "Issues" },
          { id: "release-list", label: "Review releases", description: "List published and draft releases.", riskLevel: "read", domain: "Releases" },
          { id: "workflow-list", label: "Inspect workflows", description: "List repository workflow files.", riskLevel: "read", domain: "Actions" },
          { id: "secret-list", label: "Audit secrets", description: "List configured secret names without values.", riskLevel: "sensitive", domain: "Security" }
        ],
        catalog: [
          { command: "gh release create", argsText: "gh release create v0.1.0 --draft --generate-notes", notes: "Create a draft release after review.", pathType: "Advanced runner", surface: "Releases" },
          { command: "gh pr checkout", argsText: "gh pr checkout 42", notes: "Checkout a pull request locally.", pathType: "Advanced runner", surface: "Pull Requests" },
          { command: "gh run list", argsText: "gh run list", notes: "Inspect workflow runs.", pathType: "Guided workflow", surface: "Actions" },
          { command: "gh secret list", argsText: "gh secret list", notes: "List secret names without values.", pathType: "Guided workflow", surface: "Security" }
        ]
      }),
      listActivity: async () => ({
        activity: [
          { ok: true, domain: "Repository", riskLevel: "read", command: ["gh", "repo", "view", "cli/cli"], createdAt: "2026-06-28T22:04:51Z", result: { stdout: "Repository summary" } }
        ]
      }),
      previewCommand: async () => ({
        ok: true,
        executable: "gh",
        args: ["repo", "view", "cli/cli"],
        riskLevel: "read",
        warnings: [],
        redactedPreview: ["gh", "repo", "view", "cli/cli"],
        validation: { ok: true }
      }),
      runCommand: async () => ({ ok: true, result: { stdout: "done", stderr: "", exitCode: 0 } })
    };
  });
}

async function capture(page, name) {
  await page.screenshot({ path: path.join(outputDir, `${name}.png`), fullPage: true });
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await installDesktopBridge(page);
await page.goto(appUrl);
await page.getByRole("heading", { name: "Setup" }).waitFor();

await capture(page, "01-home-auth-needed");
await page.getByRole("button", { name: "Sign in with GitHub" }).click();
await page.getByRole("button", { name: "Signed in" }).waitFor();
await capture(page, "02-home-auth-ready");

await page.getByRole("tab", { name: "Work" }).click();
await page.getByRole("button", { name: "Releases" }).click();
await capture(page, "03-work-releases");

await page.getByRole("tab", { name: "Advanced" }).click();
await page.getByRole("textbox", { name: "Command", exact: true }).fill("gh repo view cli/cli");
await page.getByRole("button", { name: "Preview" }).click();
await page.locator("#advanced").getByText("gh repo view cli/cli").waitFor();
await capture(page, "04-advanced-preview");

await page.getByRole("tab", { name: "Settings" }).click();
await capture(page, "05-settings");

await browser.close();
