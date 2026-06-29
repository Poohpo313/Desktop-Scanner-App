import { useCallback, useEffect, useMemo, useState } from "react";
import TopBar from "../components/TopBar";
import { cloudApi } from "../api/cloud.api";
import { usersApi } from "../api/users.api";
import { useNotificationStore } from "../store/notificationStore";
import type { CloudStorage, VerificationRequest } from "../types";
import "../styles/cloud-storage.css";

type CloudUserRow = NonNullable<CloudStorage["perUser"]>[number] & {
  department?: string | null;
  status?: string | null;
};

type CloudVerificationRow = VerificationRequest & {
  serialKey?: string | null;
  deviceName?: string | null;
  status?: string | null;
};

type VerificationFilterPanel = "sort" | "select";

const emptyStorage: CloudStorage = {
  totalGb: 0,
  usedGb: 0,
  percent: 0,
  perUser: [],
};

const sortOptions = ["Name", "Device Name", "Recently Request", "Latest Request"];
const selectOptions = ["Select all to Approve", "Select all to Reject"];

const formatStorage = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

const formatRequestDate = (value?: string) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

export default function CloudStoragePage() {
  const [storage, setStorage] = useState<CloudStorage>(emptyStorage);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [query, setQuery] = useState("");
  const [verificationQuery, setVerificationQuery] = useState("");
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [verificationFilterOpen, setVerificationFilterOpen] = useState<VerificationFilterPanel | null>(null);
  const [verificationSort, setVerificationSort] = useState("");
  const [verificationSelection, setVerificationSelection] = useState("");
  const [draftVerificationSort, setDraftVerificationSort] = useState("");
  const [draftVerificationSelection, setDraftVerificationSelection] = useState("");
  const push = useNotificationStore((s) => s.push);

  const load = useCallback(() => {
    Promise.all([cloudApi.storage(), cloudApi.verificationList()])
      .then(([nextStorage, nextVerifications]) => {
        setStorage({ ...emptyStorage, ...nextStorage, perUser: nextStorage.perUser ?? [] });
        setVerifications(nextVerifications);
      })
      .catch(() => push("Failed to load cloud data", "error"));
  }, [push]);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const perUser = (storage.perUser ?? []) as CloudUserRow[];

    return perUser.filter((row) => {
      if (!normalizedQuery) return true;

      return [row.username, row.department, row.usedGb, row.quotaGb]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery));
    });
  }, [query, storage.perUser]);

  const warningCount = useMemo(
    () => (storage.perUser ?? []).filter((row) => row.quotaGb > 0 && row.usedGb / row.quotaGb >= 0.9).length,
    [storage.perUser],
  );
  const totalCloudUsers = storage.perUser?.length ?? 0;
  const hasRows = rows.length > 0;
  const verificationRows = useMemo(() => {
    const normalizedQuery = verificationQuery.trim().toLowerCase();
    const list = (verifications as CloudVerificationRow[]).filter((item) => {
      if (!normalizedQuery) return true;

      return [item.username, item.email, item.serialKey, item.deviceName, item.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery));
    });

    if (verificationSort === "Name") {
      list.sort((a, b) => a.username.localeCompare(b.username));
    }
    if (verificationSort === "Device Name") {
      list.sort((a, b) => String(a.deviceName ?? "").localeCompare(String(b.deviceName ?? "")));
    }
    if (verificationSort === "Recently Request") {
      list.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
    }
    if (verificationSort === "Latest Request") {
      list.sort((a, b) => new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime());
    }

    return list;
  }, [verificationQuery, verificationSort, verifications]);
  const openVerificationFilter = (panel: VerificationFilterPanel) => {
    setDraftVerificationSort(verificationSort);
    setDraftVerificationSelection(verificationSelection);
    setVerificationFilterOpen(panel);
  };
  const closeVerificationFilter = () => setVerificationFilterOpen(null);
  const applyVerificationFilter = () => {
    if (verificationFilterOpen === "sort") setVerificationSort(draftVerificationSort);
    if (verificationFilterOpen === "select") setVerificationSelection(draftVerificationSelection);
    closeVerificationFilter();
  };
  const cancelVerificationFilter = () => {
    closeVerificationFilter();
  };

  return (
    <>
      <TopBar
        title="Cloud Storage"
        subtitle="View storage usage per user and manage subscriptions."
        showLogout={false}
      />

      <main className="cloud-page">
        <section className="cloud-stats">
          <article className="cloud-stat-card">
            <span className="cloud-stat-card__icon cloud-stat-card__icon--blue">
              <img src="/assets/Cloud.svg" alt="" aria-hidden="true" />
            </span>
            <div>
              <p>Total Cloud Users</p>
              <strong>{totalCloudUsers.toLocaleString()}</strong>
              <span>Registered Users</span>
            </div>
          </article>

          <article className="cloud-stat-card">
            <span className="cloud-stat-card__icon cloud-stat-card__icon--green">
              <img src="/assets/Storage.svg" alt="" aria-hidden="true" />
            </span>
            <div>
              <p>Total Storage Used</p>
              <strong>
                {formatStorage(storage.usedGb)} / {formatStorage(storage.totalGb)} GB
              </strong>
              <span>{storage.percent}% of total storage</span>
            </div>
          </article>

          <article className="cloud-stat-card">
            <span className="cloud-stat-card__icon cloud-stat-card__icon--yellow">
              <img src="/assets/Warning.svg" alt="" aria-hidden="true" />
            </span>
            <div>
              <p>Storage Warning</p>
              <strong>{warningCount}</strong>
              <span>User over 90% storage</span>
            </div>
          </article>
        </section>

        <section className="cloud-card">
          <div className="cloud-toolbar">
            <label className="cloud-search">
              <span className="sr-only">Search users</span>
              <img src="/assets/search-icon.svg" alt="" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search users..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <button
              className="cloud-verification-button"
              type="button"
              onClick={() => setVerificationOpen(true)}
            >
              <img src="/assets/User.svg" alt="" aria-hidden="true" />
              User Cloud Verification
            </button>
          </div>

          <div className="cloud-table-wrap">
            <table className="cloud-table">
              <thead>
                <tr>
                  <th>Registered User</th>
                  <th>Department</th>
                  <th>Storage Used</th>
                  <th>Total Storage</th>
                  <th>Usage</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const usage = row.quotaGb > 0 ? Math.round((row.usedGb / row.quotaGb) * 100) : 0;
                  const isFull = usage >= 90;
                  const status = row.status ?? (isFull ? "full" : "active");

                  return (
                    <tr key={row.userId}>
                      <td>{row.username}</td>
                      <td>{row.department ?? "-"}</td>
                      <td>{formatStorage(row.usedGb)} GB</td>
                      <td>{formatStorage(row.quotaGb)} GB</td>
                      <td>
                        <span className="cloud-usage">
                          <span className="cloud-usage__track">
                            <span
                              className={isFull ? "cloud-usage__bar cloud-usage__bar--warning" : "cloud-usage__bar"}
                              style={{ width: `${Math.min(usage, 100)}%` }}
                            />
                          </span>
                          <span>{usage}%</span>
                        </span>
                      </td>
                      <td>
                        <span className={status === "full" ? "cloud-status cloud-status--full" : "cloud-status"}>
                          {status}
                        </span>
                      </td>
                      <td>
                        {isFull ? (
                          <button className="cloud-message-button" type="button">
                            Send Message
                          </button>
                        ) : (
                          <span className="cloud-action-empty">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {!hasRows && (
                  <tr>
                    <td className="cloud-table__empty" colSpan={7}>
                      No cloud storage data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="cloud-footer">
            <span>
              {hasRows
                ? `Showing 1 to ${Math.min(rows.length, 5)} of ${rows.length} entries`
                : "Showing 0 entries"}
            </span>
            {hasRows && (
              <div className="cloud-pagination" aria-label="Cloud storage pages">
                <button type="button">&lt;</button>
                <button className="cloud-pagination__active" type="button">1</button>
                <button type="button">2</button>
                <button type="button">3</button>
                <button type="button">4</button>
                <button type="button">5</button>
                <button type="button">&gt;</button>
              </div>
            )}
          </div>

          <p className="cloud-note">
            Users with full storage can receive a subscription reminder using the Send Message action.
          </p>
        </section>
      </main>

      {verificationOpen && (
        <div className="cloud-verification-backdrop" role="presentation">
          <section className="cloud-verification-modal" role="dialog" aria-modal="true">
            <button
              className="cloud-verification-modal__close"
              type="button"
              aria-label="Close cloud verification"
              onClick={() => setVerificationOpen(false)}
            />
            <h2>Pending Cloud Access Request</h2>
            <p>Review and verify users who requested access to cloud synchronization.</p>

            <div className="cloud-verification-toolbar">
              <label className="cloud-verification-search">
                <span className="sr-only">Search users</span>
                <img src="/assets/search-icon.svg" alt="" aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search users..."
                  value={verificationQuery}
                  onChange={(event) => setVerificationQuery(event.target.value)}
                />
              </label>
              <button type="button" onClick={() => openVerificationFilter("sort")}>
                Sort By
              </button>
              <button type="button" onClick={() => openVerificationFilter("select")}>
                Select
              </button>
              <button className="cloud-verification-refresh" type="button" onClick={load} aria-label="Refresh requests">
                <img src="/assets/Refresh.svg" alt="" aria-hidden="true" />
              </button>
            </div>

            <div className="cloud-verification-table-wrap">
              <table className="cloud-verification-table">
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Serial Key</th>
                    <th>Request Date</th>
                    <th>Device Name</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {verificationRows.map((item) => (
                    <tr key={item.userId}>
                      <td>{item.username}</td>
                      <td>{item.serialKey ?? "-"}</td>
                      <td>{formatRequestDate(item.requestedAt)}</td>
                      <td>{item.deviceName ?? "-"}</td>
                      <td>
                        <span className="cloud-request-status">{item.status ?? "Pending"}</span>
                      </td>
                      <td>
                        <span className="cloud-request-actions">
                          <button
                            className="cloud-request-reject"
                            type="button"
                            onClick={async () => {
                              await cloudApi.reject(item.userId);
                              push(`Rejected ${item.username}`, "success");
                              load();
                            }}
                          >
                            Reject
                          </button>
                          <button
                            className="cloud-request-approve"
                            type="button"
                            onClick={async () => {
                              await cloudApi.verify(item.userId);
                              await usersApi.verifyCloud(item.userId);
                              push(`Approved ${item.username}`, "success");
                              load();
                            }}
                          >
                            Approve
                          </button>
                        </span>
                      </td>
                    </tr>
                  ))}

                  {verificationRows.length === 0 && (
                    <tr>
                      <td className="cloud-verification-table__empty" colSpan={6}>
                        No pending cloud access requests.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="cloud-verification-footer">
              <span>
                {verificationRows.length > 0
                  ? `Showing 1 to ${Math.min(verificationRows.length, 5)} of ${verificationRows.length} entries`
                  : "Showing 0 entries"}
              </span>
            </div>
          </section>

          {verificationFilterOpen && (
            <div
              className="cloud-verification-filter-backdrop"
              role="presentation"
              onMouseDown={closeVerificationFilter}
            >
              <div
                className="cloud-verification-filter"
                role="dialog"
                aria-modal="true"
                onMouseDown={(event) => event.stopPropagation()}
              >
                <div className="cloud-verification-filter__header">
                  <h3>{verificationFilterOpen === "sort" ? "Select Sort" : "Select an Option"}</h3>
                  <button type="button" onClick={closeVerificationFilter} aria-label="Close filter" />
                </div>

                <div className="cloud-verification-filter__options">
                  {(verificationFilterOpen === "sort" ? sortOptions : selectOptions).map((option) => (
                    <button
                      className={
                        (verificationFilterOpen === "sort" ? draftVerificationSort : draftVerificationSelection) === option
                          ? "cloud-verification-filter__option--selected"
                          : ""
                      }
                      key={option}
                      type="button"
                      onClick={() => {
                        if (verificationFilterOpen === "sort") setDraftVerificationSort(option);
                        if (verificationFilterOpen === "select") setDraftVerificationSelection(option);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <div className="cloud-verification-filter__actions">
                  <button type="button" onClick={cancelVerificationFilter}>
                    Cancel
                  </button>
                  <button type="button" onClick={applyVerificationFilter}>
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
