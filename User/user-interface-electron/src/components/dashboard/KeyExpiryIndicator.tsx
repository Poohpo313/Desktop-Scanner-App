import { useMemo, useState } from "react";
import { useKeyExpiryStatus } from "../../hooks/useKeyExpiryStatus";
import { useSession } from "../../context/SessionContext";
import { previewNewExpiry } from "../../lib/keyExpiry";
import { StatusBadge } from "./StatusBadge";
import "../../styles/key-expiry.css";

const SHORTCUTS = [
  { label: "1 Month", days: 30 },
  { label: "3 Months", days: 90 },
  { label: "1 Year", days: 365 },
] as const;

export function KeyExpiryIndicator() {
  const { session } = useSession();
  const { status, refresh } = useKeyExpiryStatus();
  const [panelOpen, setPanelOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestedDays, setRequestedDays] = useState(365);
  const [userNote, setUserNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [activeShortcut, setActiveShortcut] = useState<number | null>(365);

  const key = status?.key;
  const threshold = key?.threshold ?? "none";

  const pillLabel = useMemo(() => {
    if (!key?.hasExpiry) return null;
    if (key.isExpired) return "Key expired · Renewal required";
    if (threshold === "red") return `${key.daysRemaining} days left · Action required`;
    if (threshold === "amber") return `${key.daysRemaining} days left · Expiring soon`;
    return `Key valid · ${key.daysRemaining} days left`;
  }, [key, threshold]);

  if (!session.token || !pillLabel) return null;

  async function handleSubmitRequest() {
    if (!window.bukolabs?.keys) return;
    setSubmitting(true);
    setMessage(null);
    const isRenewal = key?.isExpired;
    const result = isRenewal
      ? await window.bukolabs.keys.requestRenewal({
          requestedDays,
          userNote: userNote.trim() || undefined,
          userId: session.userId ?? undefined,
        })
      : await window.bukolabs.keys.requestExtension({
          requestedDays,
          userNote: userNote.trim() || undefined,
          userId: session.userId ?? undefined,
        });

    setSubmitting(false);
    if (result.success) {
      const data = result.data as { message?: string };
      setMessage(data.message ?? "Request sent successfully.");
      setRequestOpen(false);
      void refresh();
    } else {
      setMessage(result.error ?? "Could not send request.");
    }
  }

  const previewDate = previewNewExpiry(key?.expiresAt, key?.isExpired ?? false, requestedDays);

  return (
    <>
      <StatusBadge
        label={pillLabel}
        icon="shieldCheck"
        active={threshold === "green"}
        className={
          threshold === "amber"
            ? "dash-status-badge--expiry-amber"
            : threshold === "red" || threshold === "expired"
              ? "dash-status-badge--expiry-red"
              : "dash-status-badge--expiry-green"
        }
        onClick={() => setPanelOpen(true)}
        title="View key expiry details"
      />

      {panelOpen ? (
        <div className="key-expiry-backdrop" onClick={() => setPanelOpen(false)}>
          <div className="key-expiry-panel" onClick={(e) => e.stopPropagation()} role="dialog">
            <header className="key-expiry-panel__header">
              <h2>License Key Status</h2>
              <button type="button" className="key-expiry-panel__close" onClick={() => setPanelOpen(false)}>
                ×
              </button>
            </header>

            <section className="key-expiry-panel__section">
              <h3>Key Info</h3>
              <dl className="key-expiry-panel__dl">
                <div><dt>Serial Key</dt><dd>{key?.serialKeyMasked}</dd></div>
                <div><dt>Status</dt><dd>{key?.statusLabel}</dd></div>
                <div>
                  <dt>Activated on</dt>
                  <dd>{key?.activatedOn ? new Date(key.activatedOn).toLocaleDateString() : "—"}</dd>
                </div>
                <div>
                  <dt>Expires on</dt>
                  <dd>{key?.expiresAt ? new Date(key.expiresAt).toLocaleDateString() : "Never"}</dd>
                </div>
                <div>
                  <dt>Days remaining</dt>
                  <dd>
                    {key?.isExpired
                      ? `Expired ${key.daysExpired ?? 0} days ago`
                      : (key?.daysRemaining ?? "—")}
                  </dd>
                </div>
                <div><dt>Original duration</dt><dd>{key?.durationDays ? `${key.durationDays} days` : "—"}</dd></div>
              </dl>
            </section>

            <section className="key-expiry-panel__section">
              <h3>Your Assigned Admin</h3>
              <dl className="key-expiry-panel__dl">
                <div><dt>Name</dt><dd>{status?.assignedAdmin?.adminName ?? "—"}</dd></div>
                <div><dt>Department</dt><dd>{status?.assignedAdmin?.department ?? "—"}</dd></div>
                <div><dt>Email</dt><dd>{status?.assignedAdmin?.email ?? "—"}</dd></div>
                <div><dt>Phone</dt><dd>{status?.assignedAdmin?.phoneNumber ?? "—"}</dd></div>
              </dl>
            </section>

            {message ? <p className="key-expiry-panel__message">{message}</p> : null}

            <button
              type="button"
              className="key-expiry-panel__cta"
              disabled={!!status?.pendingRequest}
              onClick={() => setRequestOpen(true)}
            >
              {key?.isExpired ? "Request Renewal" : "Request Extension"}
            </button>
            <p className="key-expiry-panel__hint">
              Your request will be sent to your assigned admin, who will forward it to the system
              administrator for approval.
            </p>
          </div>
        </div>
      ) : null}

      {requestOpen ? (
        <div className="key-expiry-backdrop key-expiry-backdrop--modal" onClick={() => setRequestOpen(false)}>
          <div className="key-expiry-panel key-expiry-panel--request" onClick={(e) => e.stopPropagation()}>
            <h2>{key?.isExpired ? "Request Key Renewal" : "Request Key Extension"}</h2>

            <div className="key-expiry-shortcuts">
              {SHORTCUTS.map((shortcut) => (
                <button
                  key={shortcut.days}
                  type="button"
                  className={activeShortcut === shortcut.days ? "active" : ""}
                  onClick={() => {
                    setActiveShortcut(shortcut.days);
                    setRequestedDays(shortcut.days);
                  }}
                >
                  {shortcut.label}
                </button>
              ))}
            </div>

            <div className="key-expiry-stepper">
              <button type="button" onClick={() => { setActiveShortcut(null); setRequestedDays(Math.max(1, requestedDays - 1)); }}>−</button>
              <input
                type="number"
                min={1}
                value={requestedDays}
                onChange={(e) => {
                  setActiveShortcut(null);
                  setRequestedDays(Math.max(1, Number(e.target.value) || 1));
                }}
              />
              <button type="button" onClick={() => { setActiveShortcut(null); setRequestedDays(requestedDays + 1); }}>+</button>
            </div>

            <p className="key-expiry-preview">
              New expiry date: {previewDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </p>

            <label className="key-expiry-note">
              <span>Note to admin</span>
              <textarea
                rows={3}
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                placeholder="Describe why you need an extension, or add any context for your admin..."
              />
            </label>

            <div className="key-expiry-panel__actions">
              <button type="button" className="scan-btn scan-btn--outline" onClick={() => setRequestOpen(false)}>
                Cancel
              </button>
              <button type="button" className="scan-btn scan-btn--primary" disabled={submitting} onClick={() => void handleSubmitRequest()}>
                {submitting ? "Sending…" : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
