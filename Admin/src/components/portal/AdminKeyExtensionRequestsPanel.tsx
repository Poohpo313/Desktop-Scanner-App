import { useCallback, useEffect, useState } from "react";
import type { AxiosError } from "axios";
import { keysApi } from "../../api/keys.api";
import { extractApiError } from "../../lib/extractApiError";
import { useNotificationStore } from "../../store/notificationStore";

type KeyExtensionRequest = {
  requestId: number;
  type: string;
  requestedDays: number;
  userNote?: string | null;
  requestedAt: string;
  serialKey?: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

export default function AdminKeyExtensionRequestsPanel() {
  const [requests, setRequests] = useState<KeyExtensionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const push = useNotificationStore((s) => s.push);

  const load = useCallback(() => {
    setLoading(true);
    keysApi
      .listExtensionRequests()
      .then((rows) => setRequests(Array.isArray(rows) ? rows : []))
      .catch((error: AxiosError) => {
        if (error.response?.status === 404) {
          setRequests([]);
          return;
        }

        const message = extractApiError(error, "");
        if (message) {
          push("Could not load extension requests", "error");
        }
        setRequests([]);
      })
      .finally(() => setLoading(false));
  }, [push]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleForward(request: KeyExtensionRequest) {
    const adminNote = window.prompt("Add a note for Super Admin (e.g. payment received):") ?? undefined;
    try {
      await keysApi.forwardExtensionRequest(request.requestId, adminNote);
      push("Request forwarded to Super Admin", "success");
      load();
    } catch {
      push("Could not forward request", "error");
    }
  }

  async function handleReject(request: KeyExtensionRequest) {
    const note = window.prompt("Rejection note (optional):") ?? undefined;
    try {
      await keysApi.rejectExtensionRequest(request.requestId, note);
      push("Request rejected", "success");
      load();
    } catch {
      push("Could not reject request", "error");
    }
  }

  if (!loading && requests.length === 0) return null;

  return (
    <section className="license-key-requests-panel">
      <h2 className="license-key-requests-panel__title">Incoming Extension Requests</h2>
      {loading ? <p>Loading…</p> : null}
      {!loading && requests.length > 0 ? (
        <table className="license-key-requests-panel__table">
          <thead>
            <tr>
              <th>User</th>
              <th>Key</th>
              <th>Type</th>
              <th>Days</th>
              <th>Note</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => {
              const name =
                [request.firstName, request.lastName].filter(Boolean).join(" ").trim() ||
                request.username ||
                "User";
              return (
                <tr key={request.requestId}>
                  <td>{name}</td>
                  <td>{request.serialKey ?? "—"}</td>
                  <td>{request.type}</td>
                  <td>{request.requestedDays}</td>
                  <td>{request.userNote || "—"}</td>
                  <td>{new Date(request.requestedAt).toLocaleDateString()}</td>
                  <td>
                    <button type="button" className="scan-btn scan-btn--primary scan-btn--sm" onClick={() => void handleForward(request)}>
                      Forward
                    </button>
                    <button type="button" className="scan-btn scan-btn--outline scan-btn--sm" onClick={() => void handleReject(request)}>
                      Reject
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : null}
    </section>
  );
}
