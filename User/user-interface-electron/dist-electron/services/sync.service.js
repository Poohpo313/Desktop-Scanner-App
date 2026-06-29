"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncService = void 0;
const fs_1 = __importDefault(require("fs"));
const db_service_1 = require("./db.service");
const api_service_1 = require("./api.service");
exports.syncService = {
    async trigger() {
        const online = await (0, api_service_1.isOnlineAvailable)();
        if (!online) {
            return { queued: 0, error: "Offline — cannot reach the online database API" };
        }
        if (!(0, api_service_1.getOnlineAccessToken)()) {
            return { queued: 0, error: "Not logged in to the online API. Sign in while connected." };
        }
        const pending = await (0, db_service_1.query)(`SELECT d.document_id, d.filename, d.file_path, d.file_type, d.file_size, d.file_hash, d.ocr_text
       FROM cloud_sync cs
       INNER JOIN documents d ON d.document_id = cs.document_id
       WHERE cs.sync_status IN ('pending', 'failed') AND cs.retry_count < 3
         AND d.is_deleted = FALSE`);
        if (!pending.length) {
            return { queued: 0, synced: 0 };
        }
        const batch = pending
            .map((row) => {
            if (!fs_1.default.existsSync(row.file_path))
                return null;
            const buffer = fs_1.default.readFileSync(row.file_path);
            return {
                filename: row.filename,
                mimeType: row.file_type ?? undefined,
                fileSize: Number(row.file_size ?? buffer.length),
                fileHash: row.file_hash,
                ocrText: row.ocr_text ?? undefined,
                contentBase64: buffer.toString("base64")
            };
        })
            .filter(Boolean);
        const result = await (0, api_service_1.uploadDocumentsBatch)(batch);
        if (!result.success) {
            for (const row of pending) {
                await (0, db_service_1.query)(`UPDATE cloud_sync SET sync_status = 'failed', retry_count = retry_count + 1,
           sync_date = NOW(), error_message = $2 WHERE document_id = $1`, [row.document_id, result.error.slice(0, 500)]);
            }
            return { queued: pending.length, synced: 0, error: result.error };
        }
        for (const row of pending) {
            await (0, db_service_1.query)(`UPDATE cloud_sync SET sync_status = 'completed', sync_date = NOW(), error_message = NULL
         WHERE document_id = $1`, [row.document_id]);
            await (0, db_service_1.query)(`UPDATE documents SET cloud_status = 'synced' WHERE document_id = $1`, [row.document_id]);
        }
        return {
            queued: pending.length,
            synced: pending.length,
            results: result.data
        };
    },
    async status() {
        const rows = await (0, db_service_1.query)("SELECT sync_status FROM cloud_sync");
        const pending = rows.filter((r) => r.sync_status === "pending").length;
        const synced = rows.filter((r) => r.sync_status === "completed").length;
        const failed = rows.filter((r) => r.sync_status === "failed").length;
        const docs = await (0, db_service_1.query)("SELECT file_size FROM documents WHERE is_deleted = FALSE");
        const storageUsed = docs.reduce((sum, d) => sum + Number(d.file_size ?? 0), 0);
        const online = await (0, api_service_1.isOnlineAvailable)();
        return { pending, synced, failed, storageUsed, online };
    }
};
