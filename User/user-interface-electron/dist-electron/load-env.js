"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnvFile = loadEnvFile;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/** Load `.env` into process.env before DB/API services initialize. */
function loadEnvFile() {
    const candidates = [
        path_1.default.join(process.cwd(), ".env"),
        path_1.default.join(__dirname, "..", ".env"),
        path_1.default.join(process.resourcesPath ?? "", "app-env", ".env"),
    ];
    for (const envPath of candidates) {
        if (!fs_1.default.existsSync(envPath))
            continue;
        for (const line of fs_1.default.readFileSync(envPath, "utf8").split(/\r?\n/)) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#"))
                continue;
            const eq = trimmed.indexOf("=");
            if (eq <= 0)
                continue;
            const key = trimmed.slice(0, eq).trim();
            const value = trimmed.slice(eq + 1).trim();
            if (!process.env[key])
                process.env[key] = value;
        }
        return;
    }
}
