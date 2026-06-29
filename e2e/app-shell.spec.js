import { test, expect } from "@playwright/test";
import path from "node:path";

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
          { id: "release-list", label: "Review releases", description: "List published and draft releases.", riskLevel: "read", domain: "Releases" }
        ],
        catalog: [
          { command: "gh release create", argsText: "gh release create", notes: "Create a release after review.", pathType: "Advanced runner", surface: "Releases" }
        ]
      }),
      listActivity: async () => ({ activity: [] }),
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

test.beforeEach(async ({ page }) => {
  await installDesktopBridge(page);
  await page.goto(appUrl);
});

test("supports beginner setup, auth, grouped navigation, and advanced preview", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Setup" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in with GitHub" })).toBeVisible();

  await page.getByRole("button", { name: "Sign in with GitHub" }).click();
  await expect(page.getByText("Your local GitHub CLI session is authenticated.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Signed in" })).toBeDisabled();

  await page.getByRole("tab", { name: "Work" }).click();
  await expect(page.getByRole("heading", { name: "Issues, Pull Requests, and Releases" })).toBeVisible();
  await page.getByRole("button", { name: "Releases" }).click();
  await expect(page.locator("#releases").getByRole("heading", { name: "Review releases" })).toBeVisible();

  await page.getByRole("tab", { name: "Advanced" }).click();
  await page.getByRole("textbox", { name: "Command", exact: true }).fill("gh repo view cli/cli");
  await page.getByRole("button", { name: "Preview" }).click();
  await expect(page.getByText("Executable")).toBeVisible();
  await expect(page.getByText("gh repo view cli/cli")).toBeVisible();
});
