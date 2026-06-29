import fs from "fs";
import path from "path";

export type PendingActivation = {
  userId: number;
  username: string;
  serialKey: string;
  activatedAt: string;
};

let storeFile: string | null = null;

export function initPendingActivationStore(userDataPath: string) {
  storeFile = path.join(userDataPath, "pending-activations.json");
}

function readAll(): PendingActivation[] {
  if (!storeFile || !fs.existsSync(storeFile)) return [];

  try {
    const parsed = JSON.parse(fs.readFileSync(storeFile, "utf8")) as PendingActivation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(entries: PendingActivation[]) {
  if (!storeFile) return;
  fs.mkdirSync(path.dirname(storeFile), { recursive: true });
  fs.writeFileSync(storeFile, JSON.stringify(entries, null, 2), "utf8");
}

export function queuePendingActivation(entry: PendingActivation) {
  const entries = readAll().filter(
    (item) =>
      item.userId !== entry.userId &&
      item.serialKey.toLowerCase() !== entry.serialKey.toLowerCase(),
  );
  entries.push(entry);
  writeAll(entries);
}

export function removePendingActivation(serialKey: string) {
  const normalized = serialKey.trim().toLowerCase();
  writeAll(readAll().filter((item) => item.serialKey.toLowerCase() !== normalized));
}

export function listPendingActivations() {
  return readAll();
}
