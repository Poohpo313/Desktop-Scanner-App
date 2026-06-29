"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHelpIpc = registerHelpIpc;
const help_service_1 = require("../services/help.service");
function registerHelpIpc(ipcMain) {
    ipcMain.handle("help:submit-concern", (_event, payload) => help_service_1.helpService.submitConcern(payload));
    ipcMain.handle("help:list-tickets", (_event, payload) => help_service_1.helpService.listTickets(payload?.userId));
    ipcMain.handle("help:mark-reply-read", (_event, payload) => help_service_1.helpService.markReplyRead(payload.concernId));
}
