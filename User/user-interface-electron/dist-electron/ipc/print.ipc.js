"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPrintIpc = registerPrintIpc;
const print_service_1 = require("../services/print.service");
function registerPrintIpc(ipcMain) {
    ipcMain.handle("print:list-printers", async (_event, payload) => print_service_1.printService.listPrinters(payload));
    ipcMain.handle("print:start", async (_event, payload) => print_service_1.printService.print(payload));
}
