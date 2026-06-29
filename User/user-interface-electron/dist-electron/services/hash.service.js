"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashService = void 0;
const crypto_1 = require("crypto");
const argon2_1 = __importDefault(require("argon2"));
exports.hashService = {
    async hashPassword(password) {
        return argon2_1.default.hash(password, { type: argon2_1.default.argon2id });
    },
    async verifyPassword(hash, password) {
        try {
            return await argon2_1.default.verify(hash, password);
        }
        catch {
            return false;
        }
    },
    sha256(buffer) {
        return (0, crypto_1.createHash)("sha256").update(buffer).digest("hex");
    },
};
