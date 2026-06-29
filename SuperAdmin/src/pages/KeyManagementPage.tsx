import { useCallback, useEffect, useMemo, useState } from "react";
import { keysApi } from "../api/keys.api";
import { usersApi } from "../api/users.api";
import ExportKeysModal from "../components/ExportKeysModal";
import ExportKeysSuccessModal from "../components/ExportKeysSuccessModal";
import ModifyExpiryModal from "../components/ModifyExpiryModal";
import { DurationDaysInput } from "../components/DurationDaysInput";
import KeyExtensionRequestsPanel from "../components/KeyExtensionRequestsPanel";
import TopBar from "../components/TopBar";
import { exportKeysListCsv, serialKeysToExportRows } from "../data/exportKeysList";
import { extractApiError } from "../lib/extractApiError";
import { computeKeyExpiryDisplay } from "../lib/keyExpiry";
import { useNotificationStore } from "../store/notificationStore";
import type { AdminUser, SerialKey } from "../types";
import "../styles/key-management.css";

type KeyRecord = SerialKey & {
  user?: string | null;
  organization?: string | null;
  expirationDate?: string | null;
};

const getKeyStatus = (key: SerialKey) => key.status?.toLowerCase() ?? "";

const getDisplayKeyStatus = (key: SerialKey) => {
  const status = getKeyStatus(key);
  if (!key.assignedTo && (status === "used" || status === "assigned")) {
    return "unused";
  }
  return status;
};

const formatKeyStatusLabel = (key: SerialKey) => {
  const status = getDisplayKeyStatus(key);
  if (!status) return "-";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const isUsedKey = (key: SerialKey) =>
  getDisplayKeyStatus(key) === "used" && Boolean(key.assignedTo);
const isUnusedKey = (key: SerialKey) => {
  const status = getDisplayKeyStatus(key);
  return ["unused", "available"].includes(status) && !key.assignedTo;
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const getUserName = (key: KeyRecord, users: AdminUser[]) => {
  if (key.user || key.username) return key.user ?? key.username ?? "-";
  const assignedUser = users.find((user) => user.userId === key.assignedTo);
  return assignedUser?.username ?? "-";
};

const getCompanyDepartment = (key: KeyRecord) => {
  const company = key.company ?? key.organization;
  const department = key.department;
  if (company && department) return `${company}\n${department}`;
  if (company) return company;
  if (department) return department;
  return "-";
};

const getExpirationDate = (key: KeyRecord) => key.expirationDate ?? key.expiresAt ?? null;
const manualOptionValue = "__manual__";

export default function KeyManagementPage() {
  const [keys, setKeys] = useState<SerialKey[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [companyOptions, setCompanyOptions] = useState<string[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState("all");
  const [generationOrganization, setGenerationOrganization] = useState("");
  const [manualOrganization, setManualOrganization] = useState("");
  const [generationDepartment, setGenerationDepartment] = useState("");
  const [manualDepartment, setManualDepartment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [quantity, setQuantity] = useState(10);
  const [expirationDays, setExpirationDays] = useState(365);
  const [neverExpires, setNeverExpires] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<{ filename: string; sizeBytes: number; savePath: string } | null>(
    null,
  );
  const [modifyKey, setModifyKey] = useState<KeyRecord | null>(null);
  const [modifying, setModifying] = useState(false);
  const [revokingKeyIds, setRevokingKeyIds] = useState<Set<number>>(new Set());
  const push = useNotificationStore((state) => state.push);

  const load = useCallback(async () => {
    const [keysResult, usersResult, companiesResult, departmentsResult] = await Promise.allSettled([
      keysApi.list(),
      usersApi.list(),
      usersApi.companies(),
      usersApi.departments(),
    ]);

    if (keysResult.status === "fulfilled") {
      setKeys(keysResult.value);
    } else {
      push(extractApiError(keysResult.reason, "Failed to load keys"), "error");
    }

    if (usersResult.status === "fulfilled") {
      setUsers(usersResult.value);
    }

    if (companiesResult.status === "fulfilled") {
      setCompanyOptions(companiesResult.value);
    }

    if (departmentsResult.status === "fulfilled") {
      setDepartmentOptions(departmentsResult.value);
    }
  }, [push]);

  useEffect(() => {
    load();
  }, [load]);

  const records = keys as KeyRecord[];
  const totalKeys = keys.length;
  const usedKeys = keys.filter(isUsedKey).length;
  const unusedKeys = keys.filter(isUnusedKey).length;
  const usedPercent = totalKeys ? Math.round((usedKeys / totalKeys) * 100) : 0;

  const organizationOptions = useMemo(() => {
    const organizations = new Set([
      ...companyOptions,
      ...records.map((key) => key.organization ?? key.company).filter(Boolean),
    ] as string[]);
    return Array.from(organizations).sort();
  }, [companyOptions, records]);

  const allDepartmentOptions = useMemo(() => {
    const departments = new Set([
      ...departmentOptions,
      ...records.map((key) => key.department).filter(Boolean),
    ] as string[]);
    return Array.from(departments).sort();
  }, [departmentOptions, records]);

  useEffect(() => {
    if (organizationOptions.length === 0) {
      setGenerationOrganization(manualOptionValue);
    }
    if (allDepartmentOptions.length === 0) {
      setGenerationDepartment(manualOptionValue);
    }
  }, [allDepartmentOptions.length, organizationOptions.length]);

  const viewingDepartmentOptions = useMemo(() => {
    if (selectedOrganization === "all") return [];

    return Array.from(
      new Set(
        records
          .filter((key) => (key.organization ?? key.company ?? "") === selectedOrganization)
          .map((key) => key.department)
          .filter(Boolean) as string[]
      )
    ).sort();
  }, [records, selectedOrganization]);

  const filteredKeys = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return records.filter((key) => {
      const status = getDisplayKeyStatus(key);
      const organization = key.organization ?? key.company ?? "";
      const department = key.department ?? "";
      const user = getUserName(key, users);
      const companyDepartment = getCompanyDepartment(key);
      const matchesQuery =
        !normalizedQuery ||
        [key.serialKey, user, companyDepartment]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery));
      const effectiveOrganization =
        selectedOrganization === manualOptionValue ? manualOrganization.trim() : selectedOrganization;
      const matchesOrganization = effectiveOrganization === "all" || organization === effectiveOrganization;
      const matchesStatus = selectedStatus === "all" || !selectedStatus || status === selectedStatus;
      const matchesDepartment =
        effectiveOrganization === "all" ||
        filterDepartment === "all" ||
        !filterDepartment ||
        department === filterDepartment;

      return matchesQuery && matchesOrganization && matchesStatus && matchesDepartment;
    });
  }, [filterDepartment, manualOrganization, query, records, selectedOrganization, selectedStatus, users]);

  const breadcrumbTail = useMemo(() => {
    const organizationLabel =
      selectedOrganization === "all"
        ? "All companies"
        : selectedOrganization === manualOptionValue
          ? manualOrganization.trim() || "Custom company"
          : selectedOrganization;
    const departmentLabel =
      selectedOrganization !== "all" && filterDepartment !== "all" ? filterDepartment : null;
    const statusLabel =
      selectedStatus === "all" || !selectedStatus
        ? "All statuses"
        : selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1);

    return [organizationLabel, departmentLabel, statusLabel].filter(Boolean).join(" › ");
  }, [filterDepartment, manualOrganization, selectedOrganization, selectedStatus]);

  const resolveGenerationCompany = () => {
    if (generationOrganization === manualOptionValue) return manualOrganization.trim();
    return generationOrganization.trim();
  };

  const resolveGenerationDepartment = () => {
    if (generationDepartment === manualOptionValue) return manualDepartment.trim();
    return generationDepartment.trim();
  };

  const handleGenerate = async () => {
    const company = resolveGenerationCompany();
    const department = resolveGenerationDepartment();

    if (!company) {
      push("Select or enter a company before generating keys", "error");
      return;
    }
    if (!department) {
      push("Select or enter a department before generating keys", "error");
      return;
    }

    try {
      const created = await keysApi.generateBulk(quantity, {
        company,
        department,
        ...(neverExpires ? {} : { expirationDays }),
      });
      const enriched = created.map((key) => ({ ...key, company, department }));
      setKeys((current) => [...enriched, ...current]);
      push(`${created.length} keys generated for ${company} / ${department}`, "success");
      await load();
    } catch (error) {
      push(extractApiError(error, "Failed to generate keys"), "error");
    }
  };

  const handleRevoke = async (key: SerialKey) => {
    setRevokingKeyIds((current) => new Set(current).add(key.serialId));
    try {
      await keysApi.revoke(key.serialId);
      push("Key revoked and moved to Recycle Bin", "success");
      window.setTimeout(() => {
        setKeys((current) => current.filter((entry) => entry.serialId !== key.serialId));
        setRevokingKeyIds((current) => {
          const next = new Set(current);
          next.delete(key.serialId);
          return next;
        });
      }, 520);
    } catch {
      push("Failed to revoke key", "error");
      setRevokingKeyIds((current) => {
        const next = new Set(current);
        next.delete(key.serialId);
        return next;
      });
    }
  };

  const handleModifyExpiry = async (payload: { durationDays: number; note?: string }) => {
    if (!modifyKey) return;
    setModifying(true);
    try {
      await keysApi.modifyExpiry(modifyKey.serialId, payload);
      push("Expiry updated", "success");
      setModifyKey(null);
      load();
    } catch (error) {
      push(extractApiError(error, "Failed to update expiry"), "error");
    } finally {
      setModifying(false);
    }
  };

  const handleExport = async (options: Parameters<typeof exportKeysListCsv>[1]) => {
    setExporting(true);
    try {
      const rows = serialKeysToExportRows(filteredKeys, users);
      const result = exportKeysListCsv(rows, options);
      setExportOpen(false);
      setExportSuccess(result);
      push("Keys exported successfully", "success");
    } catch {
      push("Failed to export keys", "error");
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <TopBar
        title="Desktop Scanner System Administrator Console"
        sectionLabel="Keys"
        sectionActiveLabel={breadcrumbTail}
        subtitle="Generate serial keys and monitor whether they are used or unused."
        showLogout={false}
        variant="dashboard"
      >
        <button className="key-export-button" type="button" onClick={() => setExportOpen(true)}>
          Export Keys
        </button>
      </TopBar>

      <main className="key-page">
        <section className="key-stats" aria-label="Serial key summary">
          <article className="key-stat-card">
            <div className="key-stat-card__icon key-stat-card__icon--blue">
              <img src="/assets/TotalSerialKey.svg" alt="" aria-hidden="true" />
            </div>
            <div>
              <h2>Total Serial Keys</h2>
              <strong>{totalKeys}</strong>
              <p>All generated serial keys across all organizations</p>
            </div>
          </article>

          <article className="key-stat-card">
            <div className="key-stat-card__icon key-stat-card__icon--blue">
              <img src="/assets/Used.svg" alt="" aria-hidden="true" />
            </div>
            <div>
              <h2>Used</h2>
              <strong>{usedKeys}</strong>
              <p>{usedPercent}% of total</p>
            </div>
          </article>

          <article className="key-stat-card">
            <div className="key-stat-card__icon key-stat-card__icon--green">
              <img src="/assets/Unused.svg" alt="" aria-hidden="true" />
            </div>
            <div>
              <h2>Unused</h2>
              <strong>{unusedKeys}</strong>
              <p>{unusedKeys} keys available/left</p>
            </div>
          </article>
        </section>

        <section className="key-controls" aria-label="Key filters and generation">
          <div className="key-controls__filters">
            <div className="key-viewing-filters">
              <label className="key-viewing-control">
                <span>
                  <img src="/assets/ViewingOrganization.svg" alt="" aria-hidden="true" />
                  Viewing Organization:
                </span>
                <select
                  value={selectedOrganization}
                  onChange={(event) => {
                    setSelectedOrganization(event.target.value);
                    setFilterDepartment("all");
                  }}
                >
                  <option value="all">All Organizations</option>
                  {organizationOptions.map((organization) => (
                    <option key={organization} value={organization}>
                      {organization}
                    </option>
                  ))}
                </select>
              </label>

              {selectedOrganization !== "all" && (
                <label className="key-viewing-department-control">
                  <span>Department:</span>
                  <select
                    value={filterDepartment}
                    onChange={(event) => setFilterDepartment(event.target.value)}
                  >
                    <option value="all">All Departments</option>
                    {viewingDepartmentOptions.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>

            <label className="key-status-control">
              <span>Status:</span>
              <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
                <option value="all">All</option>
                <option value="used">Used</option>
                <option value="unused">Unused</option>
              </select>
            </label>
          </div>

          <div className="key-generation-row">
            {organizationOptions.length === 0 || allDepartmentOptions.length === 0 ? (
              <p className="key-generation-hint">
                No saved organizations or departments yet. Enter both values manually before generating keys.
              </p>
            ) : null}

            <label className="key-quantity-control">
              <span>Number of Serial Keys</span>
              <div className="key-stepper" aria-label="Number of serial keys">
                <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={quantity}
                  onChange={(event) => setQuantity(Math.min(100, Math.max(1, Number(event.target.value) || 1)))}
                />
                <button type="button" onClick={() => setQuantity((value) => Math.min(100, value + 1))}>
                  +
                </button>
              </div>
            </label>

            <label className="key-inline-select">
              <span>Organization</span>
              {organizationOptions.length === 0 ? (
                <input
                  className="key-manual-input key-manual-input--standalone"
                  value={manualOrganization}
                  onChange={(event) => {
                    setManualOrganization(event.target.value);
                    setGenerationOrganization(manualOptionValue);
                  }}
                  placeholder="Enter organization"
                />
              ) : (
                <>
                  <select
                    value={generationOrganization}
                    onChange={(event) => {
                      setGenerationOrganization(event.target.value);
                      if (event.target.value !== manualOptionValue) setManualOrganization("");
                    }}
                  >
                    <option value="">Select company</option>
                    <option value={manualOptionValue}>Manual entry</option>
                    {organizationOptions.map((organization) => (
                      <option key={organization} value={organization}>
                        {organization}
                      </option>
                    ))}
                  </select>
                  {generationOrganization === manualOptionValue && (
                    <input
                      className="key-manual-input"
                      value={manualOrganization}
                      onChange={(event) => setManualOrganization(event.target.value)}
                      placeholder="Enter organization"
                    />
                  )}
                </>
              )}
            </label>

            <label className="key-inline-select">
              <span>Department</span>
              {allDepartmentOptions.length === 0 ? (
                <input
                  className="key-manual-input key-manual-input--standalone"
                  value={manualDepartment}
                  onChange={(event) => {
                    setManualDepartment(event.target.value);
                    setGenerationDepartment(manualOptionValue);
                  }}
                  placeholder="Enter department"
                />
              ) : (
                <>
                  <select
                    value={generationDepartment}
                    onChange={(event) => {
                      setGenerationDepartment(event.target.value);
                      if (event.target.value !== manualOptionValue) setManualDepartment("");
                    }}
                  >
                    <option value="">Select department</option>
                    <option value={manualOptionValue}>Manual entry</option>
                    {allDepartmentOptions.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                  {generationDepartment === manualOptionValue && (
                    <input
                      className="key-manual-input"
                      value={manualDepartment}
                      onChange={(event) => setManualDepartment(event.target.value)}
                      placeholder="Enter department"
                    />
                  )}
                </>
              )}
            </label>

            <label className="key-inline-select key-inline-select--expiration">
              <span>Expiration (days)</span>
              {!neverExpires ? (
                <DurationDaysInput
                  value={expirationDays}
                  onChange={setExpirationDays}
                  previewLabel="Expires on"
                />
              ) : null}
              <label className="key-expiration-toggle">
                <input
                  type="checkbox"
                  checked={neverExpires}
                  onChange={(event) => setNeverExpires(event.target.checked)}
                />
                Never expires
              </label>
            </label>

            <button className="key-generate-button" type="button" onClick={handleGenerate}>
              <img src="/assets/GenerateKeys.svg" alt="" aria-hidden="true" />
              Generate Keys
            </button>
          </div>
        </section>

        <KeyExtensionRequestsPanel />

        <section className="key-list-card">
          <div className="key-list-card__header">
            <h2>Generated Key List</h2>
            <label className="key-list-search">
              <span className="sr-only">Search by key or user</span>
              <img src="/assets/search-icon.svg" alt="" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search by key or user..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
          </div>

          <div className="key-table-wrap">
            <table className="key-table">
              <thead>
                <tr>
                  <th>Serial Key</th>
                  <th>User</th>
                  <th>Company/<br />Department</th>
                  <th>Generated<br />Date</th>
                  <th>Status</th>
                  <th>Expiration<br />Date</th>
                  <th>Days<br />Left</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredKeys.map((key) => {
                  const expiryDisplay = computeKeyExpiryDisplay(
                    getExpirationDate(key),
                    key.durationDays ?? null,
                  );
                  return (
                  <tr
                    key={key.serialId}
                    className={
                      revokingKeyIds.has(key.serialId) ? "key-table__row--revoking" : undefined
                    }
                  >
                    <td>{key.serialKey}</td>
                    <td>{getUserName(key, users)}</td>
                    <td className="key-table__stacked">{getCompanyDepartment(key)}</td>
                    <td>{formatDate(key.generatedAt)}</td>
                    <td>
                      <span className={`key-status-pill key-status-pill--${getDisplayKeyStatus(key) || "unknown"}`}>
                        {formatKeyStatusLabel(key)}
                      </span>
                    </td>
                    <td>
                      <div className="key-expiry-cell">
                        <span>{getExpirationDate(key) ? formatDate(getExpirationDate(key)) : "Never"}</span>
                        {getExpirationDate(key) ? (
                          <button
                            type="button"
                            className="key-modify-button"
                            onClick={() => setModifyKey(key)}
                          >
                            Modify
                          </button>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      {getExpirationDate(key) ? (
                        <span className={`key-days-left key-days-left--${expiryDisplay.threshold}`}>
                          {expiryDisplay.threshold === "expired" ? "Expired" : expiryDisplay.label}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      {getKeyStatus(key) !== "revoked" ? (
                        <button className="key-revoke-button" type="button" onClick={() => handleRevoke(key)}>
                          <span aria-hidden="true">!</span>
                          Revoke
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                );
                })}

                {filteredKeys.length === 0 && (
                  <tr>
                    <td className="key-table__empty" colSpan={9}>
                      No generated keys found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="key-list-footer">
            <span>
              {filteredKeys.length
                ? `Showing 1 to ${filteredKeys.length} of ${filteredKeys.length} entries`
                : "Showing 0 entries"}
            </span>
          </div>
        </section>
      </main>

      <ExportKeysModal
        open={exportOpen}
        exporting={exporting}
        onClose={() => setExportOpen(false)}
        onExport={handleExport}
      />

      <ModifyExpiryModal
        open={!!modifyKey}
        keyRecord={modifyKey}
        saving={modifying}
        onClose={() => setModifyKey(null)}
        onApply={handleModifyExpiry}
      />

      <ExportKeysSuccessModal
        open={!!exportSuccess}
        filename={exportSuccess?.filename ?? ""}
        sizeBytes={exportSuccess?.sizeBytes ?? 0}
        onClose={() => setExportSuccess(null)}
      />
    </>
  );
}
