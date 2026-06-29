"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = initDatabase;
exports.isMemoryMode = isMemoryMode;
exports.query = query;
exports.queryOne = queryOne;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pg_1 = require("pg");
let pool = null;
let memoryMode = false;
const memory = {
    users: [],
    keys: [],
    documents: [],
    folders: [],
    cloudSync: [],
    activityLogs: [],
};
async function initDatabase(appPath) {
    const url = process.env.OFFLINE_DATABASE_URL ??
        process.env.LOCAL_DATABASE_URL ??
        "postgresql://postgres:postgres@localhost:5432/bukolabs_offline";
    const migrationDir = path_1.default.join(appPath, "db", "migrations");
    const migrationCandidates = [
        migrationDir,
        path_1.default.join(process.resourcesPath, "app", "db", "migrations"),
        path_1.default.join(process.resourcesPath, "app.asar.unpacked", "db", "migrations"),
    ];
    const migrationFolder = migrationCandidates.find((candidate) => fs_1.default.existsSync(candidate));
    try {
        pool = new pg_1.Pool({ connectionString: url, connectionTimeoutMillis: 5_000 });
        await pool.query("SELECT 1");
        if (migrationFolder) {
            const migrationFiles = fs_1.default
                .readdirSync(migrationFolder)
                .filter((file) => file.endsWith(".sql"))
                .sort();
            for (const file of migrationFiles) {
                const migration = fs_1.default.readFileSync(path_1.default.join(migrationFolder, file), "utf8");
                await pool.query(migration);
            }
        }
    }
    catch {
        memoryMode = true;
        seedMemory();
    }
}
function seedMemory() {
    if (memory.users.length)
        return;
}
function isMemoryMode() {
    return memoryMode;
}
async function query(text, params = []) {
    if (memoryMode)
        return memoryQuery(text, params);
    const res = await pool.query(text, params);
    return res.rows;
}
async function queryOne(text, params = []) {
    const rows = await query(text, params);
    return rows[0] ?? null;
}
function memoryQuery(text, params) {
    const t = text.toLowerCase();
    if (t.includes("select user_id from users where username")) {
        const u = memory.users.find((x) => x.username === params[0]);
        return u ? [{ user_id: u.user_id }] : [];
    }
    if (t.includes("from users where username")) {
        return memory.users.filter((u) => u.username === params[0]);
    }
    if (t.includes("from serial_keys where serial_key")) {
        return memory.keys.filter((k) => k.serial_key === params[0]);
    }
    if (t.includes("insert into users") && t.includes("returning")) {
        const id = memory.users.length + 1;
        memory.users.push({
            user_id: id,
            username: params[0],
            password_hash: params[1],
            account_status: "active",
            role_id: 1,
            serial_key: params[2],
        });
        return [{ user_id: id }];
    }
    if (t.includes("insert into users")) {
        const id = memory.users.length + 1;
        memory.users.push({
            user_id: id,
            username: params[0],
            password_hash: params[1],
            account_status: "active",
            role_id: 1,
        });
        return [];
    }
    if (t.includes("insert into documents")) {
        const id = memory.documents.length + 1;
        const doc = {
            document_id: id,
            filename: params[0],
            file_path: params[1],
            file_type: params[2],
            file_size: params[3],
            file_hash: params[4],
            ocr_text: params[5],
            uploaded_by: params[6],
            upload_date: new Date().toISOString(),
            cloud_status: "unsynced",
            is_deleted: false,
        };
        memory.documents.push(doc);
        memory.cloudSync.push({ document_id: id, sync_status: "pending", retry_count: 0 });
        return [{ document_id: id }];
    }
    if (t.includes("from documents where uploaded_by")) {
        return memory.documents
            .filter((d) => d.uploaded_by === params[0] && !d.is_deleted)
            .sort((a, b) => String(b.upload_date).localeCompare(String(a.upload_date)));
    }
    if (t.includes("from folders where created_by")) {
        return memory.folders.filter((f) => f.created_by === params[0]);
    }
    if (t.includes("update documents set is_deleted = true")) {
        const doc = memory.documents.find((d) => d.document_id === params[0]);
        if (doc)
            doc.is_deleted = true;
        return [];
    }
    if (t.includes("update documents set is_deleted = false")) {
        const doc = memory.documents.find((d) => d.document_id === params[0]);
        if (doc)
            doc.is_deleted = false;
        return [];
    }
    if (t.includes("from cloud_sync")) {
        return memory.cloudSync;
    }
    if (t.includes("select file_size from documents")) {
        return memory.documents.filter((d) => !d.is_deleted).map((d) => ({ file_size: d.file_size }));
    }
    if (t.includes("insert into activity_logs")) {
        memory.activityLogs.push({ user_id: params[0], action: params[1] });
        return [];
    }
    if (t.includes("update serial_keys")) {
        const key = memory.keys.find((k) => k.serial_key === params[1]);
        if (key) {
            key.status = "used";
            key.assigned_to = params[0];
        }
        return [];
    }
    if (t.includes("insert into cloud_sync")) {
        return [];
    }
    return [];
}
