"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  saveTextFile: (payload) => electron.ipcRenderer.invoke("fs:save-text-file", payload),
  openExportFolder: (exportFolder) => electron.ipcRenderer.invoke("fs:open-export-folder", exportFolder)
});
