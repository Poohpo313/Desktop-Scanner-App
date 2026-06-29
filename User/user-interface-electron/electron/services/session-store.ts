import fs from "fs";
import path from "path";

export type StoredSession = {
  token: string;
  userId: number;
  role: "user" | "admin";
  expiresAt: number;
};

let sessionsFile: string | null = null;

export function initSessionStore(userDataPath: string) {
  sessionsFile = path.join(userDataPath, "auth-sessions.json");
}

export function loadStoredSessions(): StoredSession[] {
  if (!sessionsFile || !fs.existsSync(sessionsFile)) return [];

  try {
    const raw = fs.readFileSync(sessionsFile, "utf8");
    const parsed = JSON.parse(raw) as StoredSession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredSessions(sessions: StoredSession[]) {
  if (!sessionsFile) return;

  fs.mkdirSync(path.dirname(sessionsFile), { recursive: true });
  fs.writeFileSync(sessionsFile, JSON.stringify(sessions, null, 2), "utf8");
}
