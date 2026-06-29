import { APP_STORAGE_KEYS } from "../config/appStorage";

export type LastScannerRecord = {
  id: string;
  name: string;
};

export function readLastScanner(): LastScannerRecord | null {
  try {
    const raw = localStorage.getItem(APP_STORAGE_KEYS.lastScanner);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastScannerRecord;
    if (!parsed?.id || !parsed?.name) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function rememberLastScanner(scanner: LastScannerRecord) {
  if (!scanner.id || !scanner.name) return;
  localStorage.setItem(APP_STORAGE_KEYS.lastScanner, JSON.stringify(scanner));
}

export function resolvePreferredScannerName(flowScannerName?: string | null) {
  return flowScannerName?.trim() || readLastScanner()?.name || null;
}
