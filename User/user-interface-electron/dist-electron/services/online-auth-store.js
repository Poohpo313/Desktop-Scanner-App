"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initOnlineAuthStore = initOnlineAuthStore;
exports.saveOnlineAuth = saveOnlineAuth;
exports.loadOnlineAuth = loadOnlineAuth;
exports.clearOnlineAuth = clearOnlineAuth;
exports.saveSupportContact = saveSupportContact;
exports.loadSupportContact = loadSupportContact;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let onlineAuthFile = null;
let supportContactFile = null;
function initOnlineAuthStore(userDataPath) {
    onlineAuthFile = path_1.default.join(userDataPath, "online-auth.json");
    supportContactFile = path_1.default.join(userDataPath, "support-contact.json");
}
function readJsonFile(filePath) {
    if (!filePath || !fs_1.default.existsSync(filePath))
        return null;
    try {
        return JSON.parse(fs_1.default.readFileSync(filePath, "utf8"));
    }
    catch {
        return null;
    }
}
function writeJsonFile(filePath, value) {
    if (!filePath)
        return;
    fs_1.default.mkdirSync(path_1.default.dirname(filePath), { recursive: true });
    fs_1.default.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
}
function saveOnlineAuth(userId, accessToken) {
    writeJsonFile(onlineAuthFile, {
        userId,
        accessToken,
        savedAt: Date.now(),
    });
}
function loadOnlineAuth(userId) {
    const stored = readJsonFile(onlineAuthFile);
    if (!stored?.accessToken)
        return null;
    if (userId != null && stored.userId !== userId)
        return null;
    return stored;
}
function clearOnlineAuth() {
    if (onlineAuthFile && fs_1.default.existsSync(onlineAuthFile)) {
        fs_1.default.unlinkSync(onlineAuthFile);
    }
}
function saveSupportContact(userId, contact) {
    writeJsonFile(supportContactFile, {
        userId,
        username: contact.username ?? null,
        adminName: contact.adminName ?? null,
        email: contact.email ?? null,
        phoneNumber: contact.phoneNumber ?? null,
        savedAt: Date.now(),
    });
}
function loadSupportContact(userId, username) {
    const stored = readJsonFile(supportContactFile);
    if (!stored)
        return null;
    if (userId != null && stored.userId === userId)
        return stored;
    if (username && stored.username?.toLowerCase() === username.trim().toLowerCase())
        return stored;
    if (userId == null && !username)
        return stored;
    return null;
}
