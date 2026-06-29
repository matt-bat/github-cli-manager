import { app, BrowserWindow, ipcMain, shell } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { GUIDED_COMMANDS } from "./command-manifest.js";
import { loadCommandCatalog } from "./command-catalog.js";
import { buildGuidedArgs, executeCommandText, executeGh, validateCommandText } from "./command-runner.js";
import { getSetupStatus, startAuthFlow } from "./setup.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const activity = [];
let commandCatalog = [];

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 760,
    minWidth: 1040,
    minHeight: 680,
    title: "GitHub CLI Manager",
    backgroundColor: "#f4f5f7",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  mainWindow.loadFile(path.join(rootDir, "public", "index.html"));
}

function recordActivity(entry) {
  activity.unshift({
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...entry
  });
  activity.splice(100);
}

function registerIpc() {
  ipcMain.handle("setup:status", async () => getSetupStatus());
  ipcMain.handle("setup:auth:start", async () => {
    const response = await startAuthFlow();
    recordActivity({
      command: ["gh", "auth", "login", "--web", "--git-protocol", "https", "--hostname", "github.com"],
      riskLevel: "write",
      domain: "Settings",
      ok: response.ok,
      result: response.result
    });
    return response;
  });
  ipcMain.handle("commands:list", async () => ({ guided: GUIDED_COMMANDS, catalog: commandCatalog }));
  ipcMain.handle("activity:list", async () => ({ activity }));

  ipcMain.handle("commands:preview", async (_event, body = {}) => {
    if (body.commandId) {
      return buildGuidedArgs({ commandId: body.commandId, repo: body.repo });
    }
    return validateCommandText(body.argsText ?? "", { confirmed: Boolean(body.confirmed) });
  });

  ipcMain.handle("commands:run", async (_event, body = {}) => {
    const built = body.commandId
      ? buildGuidedArgs({ commandId: body.commandId, repo: body.repo })
      : validateCommandText(body.argsText ?? "", { confirmed: Boolean(body.confirmed) });

    if (!built.ok) {
      return { ok: false, validation: built };
    }
    if ((built.riskLevel === "write" || built.riskLevel === "destructive") && body.confirmed !== true) {
      return {
        ok: false,
        validation: built,
        message: "This command changes GitHub state. Confirm it before execution."
      };
    }

    const execution = body.commandId
      ? await executeGh(built.args, { confirmed: true, timeoutMs: 60000, cwd: body.cwd })
      : await executeCommandText(body.argsText ?? "", { confirmed: true, timeoutMs: 60000, cwd: body.cwd });
    recordActivity({
      command: built.redactedPreview,
      riskLevel: built.riskLevel,
      domain: built.domain,
      ok: execution.ok,
      result: execution.result
    });
    return execution;
  });
}

app.whenReady().then(async () => {
  commandCatalog = await loadCommandCatalog();
  registerIpc();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
