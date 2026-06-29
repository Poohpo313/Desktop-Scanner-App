import fs from "fs";
import path from "path";

export type StoredOnlineAuth = {
  userId: number;
  accessToken: string;
  savedAt: number;
};

export type StoredSupportContact = {
  userId: number;
  username?: string | null;
  adminName: string | null;
  email: string | null;
  phoneNumber: string | null;
  savedAt: number;
};

let onlineAuthFile: string | null = null;
let supportContactFile: string | null = null;

export function initOnlineAuthStore(userDataPath: string) {
  onlineAuthFile = path.join(userDataPath, "online-auth.json");
  supportContactFile = path.join(userDataPath, "support-contact.json");
}

function readJsonFile<T>(filePath: string | null): T | null {
  if (!filePath || !fs.existsSync(filePath)) return null;

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
  } catch {
    return null;
  }
}

function writeJsonFile(filePath: string | null, value: unknown) {
  if (!filePath) return;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
}

export function saveOnlineAuth(userId: number, accessToken: string) {
  writeJsonFile(onlineAuthFile, {
    userId,
    accessToken,
    savedAt: Date.now(),
  } satisfies StoredOnlineAuth);
}

export function loadOnlineAuth(userId?: number): StoredOnlineAuth | null {
  const stored = readJsonFile<StoredOnlineAuth>(onlineAuthFile);
  if (!stored?.accessToken) return null;
  if (userId != null && stored.userId !== userId) return null;
  return stored;
}

export function clearOnlineAuth() {
  if (onlineAuthFile && fs.existsSync(onlineAuthFile)) {
    fs.unlinkSync(onlineAuthFile);
  }
}

export function saveSupportContact(
  userId: number,
  contact: {
    username?: string | null;
    adminName?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
  },
) {
  writeJsonFile(supportContactFile, {
    userId,
    username: contact.username ?? null,
    adminName: contact.adminName ?? null,
    email: contact.email ?? null,
    phoneNumber: contact.phoneNumber ?? null,
    savedAt: Date.now(),
  } satisfies StoredSupportContact);
}

export function loadSupportContact(userId?: number, username?: string): StoredSupportContact | null {
  const stored = readJsonFile<StoredSupportContact>(supportContactFile);
  if (!stored) return null;
  if (userId != null && stored.userId === userId) return stored;
  if (username && stored.username?.toLowerCase() === username.trim().toLowerCase()) return stored;
  if (userId == null && !username) return stored;
  return null;
}
