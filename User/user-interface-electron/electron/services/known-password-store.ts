import fs from "fs";
import path from "path";

type KnownPasswordEntry = {
  password: string;
  savedAt: number;
};

type KnownPasswordStore = Record<string, KnownPasswordEntry>;

let storeFile: string | null = null;

export function initKnownPasswordStore(userDataPath: string) {
  storeFile = path.join(userDataPath, "known-login-passwords.json");
}

function readStore(): KnownPasswordStore {
  if (!storeFile || !fs.existsSync(storeFile)) return {};

  try {
    return JSON.parse(fs.readFileSync(storeFile, "utf8")) as KnownPasswordStore;
  } catch {
    return {};
  }
}

function writeStore(store: KnownPasswordStore) {
  if (!storeFile) return;
  fs.mkdirSync(path.dirname(storeFile), { recursive: true });
  fs.writeFileSync(storeFile, JSON.stringify(store, null, 2), "utf8");
}

export function saveKnownLoginPassword(userId: number, password: string) {
  const trimmed = password.trim();
  if (!trimmed) return;

  const store = readStore();
  store[String(userId)] = { password: trimmed, savedAt: Date.now() };
  writeStore(store);
}

export function loadKnownLoginPassword(userId: number) {
  const entry = readStore()[String(userId)];
  return entry?.password?.trim() || null;
}
