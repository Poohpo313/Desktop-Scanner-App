const STORAGE_KEY = "bukolabs_recovery_request";

export type StoredRecoveryRequest = {
  requestId: string;
  submittedAt?: string;
};

export function storeRecoveryRequest(payload: StoredRecoveryRequest) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function getStoredRecoveryRequest(): StoredRecoveryRequest | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredRecoveryRequest;
    if (!parsed?.requestId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearStoredRecoveryRequest() {
  sessionStorage.removeItem(STORAGE_KEY);
}
