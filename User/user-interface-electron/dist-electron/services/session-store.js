"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSessionStore = initSessionStore;
exports.loadStoredSessions = loadStoredSessions;
exports.saveStoredSessions = saveStoredSessions;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let sessionsFile = null;
function initSessionStore(userDataPath) {
    sessionsFile = path_1.default.join(userDataPath, "auth-sessions.json");
}
function loadStoredSessions() {
    if (!sessionsFile || !fs_1.default.existsSync(sessionsFile))
        return [];
    try {
        const raw = fs_1.default.readFileSync(sessionsFile, "utf8");
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    }
    catch {
        return [];
    }
}
function saveStoredSessions(sessions) {
    if (!sessionsFile)
        return;
    fs_1.default.mkdirSync(path_1.default.dirname(sessionsFile), { recursive: true });
    fs_1.default.writeFileSync(sessionsFile, JSON.stringify(sessions, null, 2), "utf8");
}
