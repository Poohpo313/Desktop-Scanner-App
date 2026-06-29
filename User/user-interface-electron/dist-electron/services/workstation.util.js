"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkstationIdentity = getWorkstationIdentity;
const crypto_1 = require("crypto");
const os_1 = __importDefault(require("os"));
function getWorkstationIdentity() {
    const hostname = os_1.default.hostname().trim() || "User-Workstation";
    const raw = `${hostname}|${os_1.default.userInfo().username}|${os_1.default.platform()}|${os_1.default.arch()}`;
    const serialNumber = `ws-${(0, crypto_1.createHash)("sha256").update(raw).digest("hex").slice(0, 20)}`;
    return { deviceName: hostname, serialNumber };
}
