"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ocrService = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
/** OCR runs in a utility process to avoid blocking the renderer. */
exports.ocrService = {
    async extractText(imageBuffer) {
        return new Promise((resolve) => {
            try {
                const worker = electron_1.utilityProcess.fork(path_1.default.join(__dirname, "workers", "ocr.worker.js"));
                const timeout = setTimeout(() => {
                    worker.kill();
                    resolve("");
                }, 30_000);
                worker.on("message", (msg) => {
                    clearTimeout(timeout);
                    worker.kill();
                    resolve(msg.text ?? "");
                });
                worker.postMessage({ type: "ocr", buffer: imageBuffer });
            }
            catch {
                resolve("");
            }
        });
    },
};
