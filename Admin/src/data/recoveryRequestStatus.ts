import api from "../api/axios";
import { getStoredRecoveryRequest } from "../lib/recoverySession";

export type RecoveryStatusPhase = "under-review" | "identity-verification" | "credentials-released";

type RecoveryStatusResponse = {
  requestId: string;
  phase: RecoveryStatusPhase;
  submittedAt?: string;
};

export function getRecoveryRequestPhase(): RecoveryStatusPhase {
  return "under-review";
}

export async function fetchRecoveryRequestStatus(): Promise<RecoveryStatusPhase> {
  const stored = getStoredRecoveryRequest();
  if (!stored?.requestId) return "under-review";

  try {
    const data = await api
      .get<RecoveryStatusResponse>(`/auth/recovery/${encodeURIComponent(stored.requestId)}/status`)
      .then((r) => r.data);
    return data.phase;
  } catch {
    return "under-review";
  }
}

export function getStoredRecoveryRequestId(): string {
  return getStoredRecoveryRequest()?.requestId ?? "";
}

export function getStoredRecoverySubmittedAt(): string | undefined {
  return getStoredRecoveryRequest()?.submittedAt;
}
