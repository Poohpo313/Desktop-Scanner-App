"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initPendingActivationStore = initPendingActivationStore;
exports.queuePendingActivation = queuePendingActivation;
exports.removePendingActivation = removePendingActivation;
exports.listPendingActivations = listPendingActivations;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let storeFile = null;
function initPendingActivationStore(userDataPath) {
    storeFile = path_1.default.join(userDataPath, "pending-activations.json");
}
function readAll() {
    if (!storeFile || !fs_1.default.existsSync(storeFile))
        return [];
    try {
        const parsed = JSON.parse(fs_1.default.readFileSync(storeFile, "utf8"));
        return Array.isArray(parsed) ? parsed : [];
    }
    catch {
        return [];
    }
}
function writeAll(entries) {
    if (!storeFile)
        return;
    fs_1.default.mkdirSync(path_1.default.dirname(storeFile), { recursive: true });
    fs_1.default.writeFileSync(storeFile, JSON.stringify(entries, null, 2), "utf8");
}
function queuePendingActivation(entry) {
    const entries = readAll().filter((item) => item.userId !== entry.userId &&
        item.serialKey.toLowerCase() !== entry.serialKey.toLowerCase());
    entries.push(entry);
    writeAll(entries);
}
function removePendingActivation(serialKey) {
    const normalized = serialKey.trim().toLowerCase();
    writeAll(readAll().filter((item) => item.serialKey.toLowerCase() !== normalized));
}
function listPendingActivations() {
    return readAll();
}
