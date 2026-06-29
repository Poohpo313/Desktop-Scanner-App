import { useCallback, useEffect, useState } from "react";
import { keysApi } from "../api/keys.api";
import { extractApiError } from "../lib/extractApiError";
import { useNotificationStore } from "../store/notificationStore";
import ApproveKeyRequestModal from "./ApproveKeyRequestModal";

export type KeyExtensionRequest = {
  requestId: number;
  serialKeyId: number;
  userId: number;
  type: "extension" | "renewal";
  requestedDays: number;
  status: string;
  userNote?: string | null;
  adminNote?: string | null;
  requestedAt: string;
  forwardedAt?: string | null;
  serialKey?: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  department?: string | null;
  adminName?: string | null;
};

export default function KeyExtensionRequestsPanel() {
  const [requests, setRequests] = useState<KeyExtensionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [approveTarget, setApproveTarget] = useState<KeyExtensionRequest | null>(null);
  const push = useNotificationStore((state) => state.push);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await keysApi.listExtensionRequests();
      setRequests(rows);
    } catch (error) {
      const message = extractApiError(error, "");
      if (
        message &&
        !message.includes("Cannot GET") &&
        !message.includes("404") &&
        !message.toLowerCase().includes("not found")
      ) {
        push(extractApiError(error, "Could not load extension requests."), "error");
      }
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleReject(request: KeyExtensionRequest) {
    const note = window.prompt("Rejection note (optional):") ?? undefined;
    try {
      await keysApi.rejectExtensionRequest(request.requestId, note);
      push("Request rejected.", "success");
      void load();
    } catch (error) {
      push(extractApiError(error, "Could not reject request."), "error");
    }
  }

  return (
    <section className="key-list-card key-extension-requests">
      <div className="key-list-card__header">
        <h2>Extension & Renewal Requests</h2>
      </div>

      {loading ? <p className="key-extension-requests__empty">Loading requests…</p> : null}

      {!loading && requests.length === 0 ? (
        <p className="key-extension-requests__empty">No forwarded requests pending approval.</p>
      ) : null}

      {!loading && requests.length > 0 ? (
        <div className="key-table-wrap">
          <table className="key-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Department</th>
                <th>Type</th>
                <th>Days</th>
                <th>User note</th>
                <th>Admin note</th>
                <th>Forwarded</th>
                <th>Action</th>
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
                    <td>{request.department ?? "-"}</td>
                    <td>{request.type}</td>
                    <td>{request.requestedDays}</td>
                    <td>{request.userNote || "-"}</td>
                    <td>{request.adminNote || "-"}</td>
                    <td>
                      {request.forwardedAt
                        ? new Date(request.forwardedAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="key-extension-requests__actions">
                      <button
                        type="button"
                        className="scan-btn scan-btn--primary scan-btn--sm"
                        onClick={() => setApproveTarget(request)}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="scan-btn scan-btn--outline scan-btn--sm"
                        onClick={() => void handleReject(request)}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      <ApproveKeyRequestModal
        open={!!approveTarget}
        request={approveTarget}
        onClose={() => setApproveTarget(null)}
        onApproved={() => {
          setApproveTarget(null);
          void load();
        }}
      />
    </section>
  );
}
