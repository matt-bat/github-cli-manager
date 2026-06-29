const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("githubCliManager", {
  getSetupStatus: () => ipcRenderer.invoke("setup:status"),
  startAuthFlow: () => ipcRenderer.invoke("setup:auth:start"),
  listCommands: () => ipcRenderer.invoke("commands:list"),
  listActivity: () => ipcRenderer.invoke("activity:list"),
  previewCommand: (body) => ipcRenderer.invoke("commands:preview", body),
  runCommand: (body) => ipcRenderer.invoke("commands:run", body)
});
