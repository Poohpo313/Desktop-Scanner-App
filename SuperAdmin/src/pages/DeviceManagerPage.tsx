import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import TopBar from "../components/TopBar";
import DeviceGrid from "../components/DeviceGrid";
import Modal from "../components/Modal";
import { PortalErrorState } from "../components/PortalErrorState";
import RefreshIcon from "../components/RefreshIcon";
import { devicesApi } from "../api/devices.api";
import { keysApi } from "../api/keys.api";
import { usersApi } from "../api/users.api";
import { useNotificationStore } from "../store/notificationStore";
import { extractApiError } from "../lib/extractApiError";
import { isActionableRevocationRecord } from "../lib/normalizeRevocations";
import { isUnauthorizedSecondaryDevice, orderDevicesForHierarchy } from "../lib/deviceHierarchy";
import { isDeviceOnline, useDeviceOnlineClock } from "../lib/statusDisplay";
import type { AdminUser, Device, RevocationRecord } from "../types";
import "../styles/device-management.css";

type DeviceFilterPanel = "department" | "sort";

const sortOptions = [
  { label: "Online", value: "active" },
  { label: "Offline", value: "inactive" },
];

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const getUserLabel = (record: RevocationRecord) => {
  const name = [record.firstName, record.lastName].filter(Boolean).join(" ").trim();
  return name || record.username || "-";
};

const getCompanyDepartment = (record: RevocationRecord) => {
  if (record.company && record.department) return `${record.company} / ${record.department}`;
  return record.company ?? record.department ?? "-";
};

const getRevocationStatus = (record: RevocationRecord) => {
  if (record.requestStatus === "pending" || record.action === "revocation.requested") {
    return "Pending Review";
  }
  if (record.requestStatus === "approved" || record.action === "revocation.approved") {
    return "Approved";
  }
  return "Revoked";
};

const getRevocationReason = (record: RevocationRecord) => {
  if (record.reason?.trim()) {
    return record.reason.trim();
  }
  if (record.requestStatus === "pending" || record.action === "revocation.requested") {
    return "Pending Review";
  }
  if (record.action === "device.revoked") return "Unauthorized Device";
  if (record.action === "device.flagged_inactive" || record.status === "inactive") return "Inactive";
  if (record.action === "key.deactivated" || record.status === "deactivated") return "Inactive";
  if (record.action === "key.revoked" || record.status === "revoked") return "Unauthorized User";
  if (record.status === "unauthorized") return "Unauthorized Device";
  return "Inactive";
};

const isActionableRevocation = isActionableRevocationRecord;

const getRevokedByLabel = (record: RevocationRecord) => {
  if (record.revokedByRole === "superadmin") return "System Administrator";
  if (record.revokedByRole === "admin") return "Administrator Officer";
  const name = [record.revokedByFirstName, record.revokedByLastName].filter(Boolean).join(" ").trim();
  return name || record.revokedByUsername || "Administrator";
};

export default function DeviceManagerPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
  const [revocations, setRevocations] = useState<RevocationRecord[]>([]);
  const [revokeTarget, setRevokeTarget] = useState<Device | null>(null);
  const [query, setQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [openFilter, setOpenFilter] = useState<DeviceFilterPanel | null>(null);
  const [draftDepartmentFilter, setDraftDepartmentFilter] = useState("");
  const [draftSortBy, setDraftSortBy] = useState("");
  const [filterPosition, setFilterPosition] = useState<CSSProperties>({});
  const [revocationsOpen, setRevocationsOpen] = useState(false);
  const [revocationQuery, setRevocationQuery] = useState("");
  const [loadingRevocations, setLoadingRevocations] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const push = useNotificationStore((s) => s.push);

  const load = useCallback(async () => {
    setLoadingDevices(true);
    const [devicesResult, usersResult, departmentsResult] = await Promise.allSettled([
      devicesApi.list(),
      usersApi.list(),
      usersApi.departments(),
    ]);

    if (devicesResult.status === "fulfilled") {
      setDevices(devicesResult.value);
    } else {
      push(extractApiError(devicesResult.reason, "Failed to load devices"), "error");
      setDevices([]);
    }

    if (usersResult.status === "fulfilled") {
      setUsers(usersResult.value);
    } else {
      push(extractApiError(usersResult.reason, "Failed to load users"), "error");
      setUsers([]);
    }

    if (departmentsResult.status === "fulfilled") {
      setDepartmentOptions(Array.isArray(departmentsResult.value) ? departmentsResult.value : []);
    } else {
      setDepartmentOptions([]);
    }

    setLoadingDevices(false);
  }, [push]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
      push("Device list refreshed", "success");
    } finally {
      setRefreshing(false);
    }
  }, [load, push]);

  const loadRevocations = useCallback(() => {
    setLoadingRevocations(true);
    keysApi
      .revocations()
      .then((rows) => setRevocations(Array.isArray(rows) ? rows : []))
      .catch((error) => push(extractApiError(error, "Failed to load revocations"), "error"))
      .finally(() => setLoadingRevocations(false));
  }, [push]);

  useEffect(() => {
    load();
    loadRevocations();
  }, [load, loadRevocations]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void load();
    }, 45_000);
    return () => window.clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (revocationsOpen) loadRevocations();
  }, [loadRevocations, revocationsOpen]);

  const presenceTick = useDeviceOnlineClock();

  const filteredDevices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const list = orderDevicesForHierarchy(devices).filter((device) => {
      if (device.status === "unauthorized" && !isUnauthorizedSecondaryDevice(device)) {
        return false;
      }
      const user = users.find((item) => item.userId === device.assignedUser);
      const department = user?.department ?? "";
      const matchesDepartment = !departmentFilter || department === departmentFilter;
      const matchesQuery =
        !normalizedQuery ||
        [device.deviceName, device.serialNumber, user?.username, user?.firstName, user?.lastName]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery));

      return matchesDepartment && matchesQuery;
    });

    if (sortBy === "active" || sortBy === "inactive") {
      list.sort((a, b) => {
        const aOnline = isDeviceOnline(a);
        const bOnline = isDeviceOnline(b);
        const aMatches = sortBy === "active" ? aOnline : !aOnline;
        const bMatches = sortBy === "active" ? bOnline : !bOnline;
        if (aMatches && !bMatches) return -1;
        if (!aMatches && bMatches) return 1;
        return String(a.deviceName ?? "").localeCompare(String(b.deviceName ?? ""));
      });
    }

    return list;
  }, [departmentFilter, devices, presenceTick, query, sortBy, users]);

  const actionableRevocations = useMemo(() => revocations.filter(isActionableRevocation), [revocations]);

  const filteredRevocations = useMemo(() => {
    const normalizedQuery = revocationQuery.trim().toLowerCase();
    if (!normalizedQuery) return actionableRevocations;

    return actionableRevocations.filter((record) =>
      [record.serialKey, getUserLabel(record), getCompanyDepartment(record), getRevocationReason(record), getRevokedByLabel(record)]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery))
    );
  }, [actionableRevocations, revocationQuery]);

  const positionFilterBelow = (button: HTMLButtonElement) => {
    const rect = button.getBoundingClientRect();
    const popoverWidth = 282;
    const left = Math.min(
      Math.max(16, rect.left + rect.width / 2 - popoverWidth / 2),
      window.innerWidth - popoverWidth - 16,
    );

    setFilterPosition({
      position: "fixed",
      top: rect.bottom + 12,
      left,
      transform: "none",
    });
  };

  const openDepartmentFilter = (button: HTMLButtonElement) => {
    positionFilterBelow(button);
    setDraftDepartmentFilter(departmentFilter);
    setOpenFilter("department");
  };

  const openSortFilter = (button: HTMLButtonElement) => {
    positionFilterBelow(button);
    setDraftSortBy(sortBy);
    setOpenFilter("sort");
  };

  const closeFilter = () => setOpenFilter(null);

  const resetActiveFilter = () => {
    if (openFilter === "department") {
      setDraftDepartmentFilter("");
      setDepartmentFilter("");
    }
    if (openFilter === "sort") {
      setDraftSortBy("");
      setSortBy("");
    }
    closeFilter();
  };

  const applyActiveFilter = () => {
    if (openFilter === "department") setDepartmentFilter(draftDepartmentFilter);
    if (openFilter === "sort") setSortBy(draftSortBy);
    closeFilter();
  };

  const handlePermanentRevoke = async (record: RevocationRecord) => {
    try {
      if (record.requestStatus === "pending" && record.requestId) {
        await keysApi.approveRevocationRequest(record.requestId);
        push("Revocation request approved", "success");
        loadRevocations();
        load();
        return;
      }

      if (record.serialId) {
        await keysApi.permanentDelete(record.serialId);
      } else if (record.deviceId) {
        await devicesApi.permanentDelete(record.deviceId);
      } else {
        push("This revocation record is no longer actionable", "error");
        loadRevocations();
        return;
      }
      push("Revocation permanently removed", "success");
      loadRevocations();
      load();
    } catch (error) {
      push(extractApiError(error, "Failed to permanently revoke record"), "error");
      loadRevocations();
    }
  };

  const handleDenyRevocation = async (record: RevocationRecord) => {
    if (record.requestStatus === "pending" && record.requestId) {
      try {
        await keysApi.denyRevocationRequest(record.requestId);
        push("Revocation request disapproved", "success");
        loadRevocations();
      } catch {
        push("Failed to disapprove revocation request", "error");
      }
      return;
    }

    if (record.deviceId) {
      try {
        await devicesApi.restore(record.deviceId);
        push("Revocation disapproved and device access restored", "success");
        loadRevocations();
        load();
      } catch {
        push("Failed to disapprove device revocation", "error");
      }
      return;
    }

    if (!record.serialId) {
      push("This revocation cannot be disapproved from here", "error");
      return;
    }

    try {
      await keysApi.restoreRevokedKey(record.serialId);
      push("Revocation disapproved and access restored", "success");
      loadRevocations();
      load();
    } catch {
      push("Failed to disapprove revocation", "error");
    }
  };

  return (
    <>
      <TopBar
        title="Desktop Scanner System Administrator Console"
        sectionLabel="User Device Management"
        subtitle="View and manage registered devices and their users."
        showLogout={false}
        variant="dashboard"
      >
        <button className="device-management-revocations" type="button" onClick={() => setRevocationsOpen(true)}>
          Revocations{actionableRevocations.length > 0 ? ` (${actionableRevocations.length})` : ""}
        </button>
      </TopBar>
      <main className="device-management-page">
        <div className="device-management-controls">
          <input
            type="search"
            placeholder="Search....."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button
            className={departmentFilter ? "device-management-control-button device-management-control-button--active" : "device-management-control-button"}
            type="button"
            onClick={(event) => openDepartmentFilter(event.currentTarget)}
          >
            {departmentFilter || "All Departments"}
          </button>
          <button
            className={sortBy ? "device-management-control-button device-management-control-button--active" : "device-management-control-button"}
            type="button"
            onClick={(event) => openSortFilter(event.currentTarget)}
          >
            Sort By
          </button>
          <button className="device-management-export" type="button" onClick={() => void devicesApi.exportCsv()}>
            Export
          </button>
          <button
            className="device-management-refresh"
            type="button"
            aria-label="Refresh device list"
            disabled={refreshing}
            onClick={() => void handleRefresh()}
          >
            <RefreshIcon spinning={refreshing} />
          </button>
        </div>

        <DeviceGrid devices={filteredDevices} users={users} onRevoke={setRevokeTarget} />

        {loadingDevices && filteredDevices.length === 0 && (
          <p className="device-management-table__empty">Loading devices...</p>
        )}

        {openFilter && (
          <div className="device-filter-backdrop" role="presentation">
            <div className="device-filter-popover" role="dialog" aria-modal="true" style={filterPosition}>
              <div className="device-filter-popover__header">
                <h2>{openFilter === "department" ? "Select Departments" : "Select Sort"}</h2>
                <button type="button" onClick={closeFilter} aria-label="Close filter">
                  x
                </button>
              </div>

              <div className="device-filter-options">
                {openFilter === "department" &&
                  departmentOptions.map((department) => (
                    <button
                      className={draftDepartmentFilter === department ? "device-filter-option--selected" : ""}
                      key={department}
                      type="button"
                      onClick={() => setDraftDepartmentFilter(department)}
                    >
                      <span>{department}</span>
                      {draftDepartmentFilter === department && <strong>✓</strong>}
                    </button>
                  ))}

                {openFilter === "department" && departmentOptions.length === 0 && (
                  <p className="device-filter-empty">No departments found yet.</p>
                )}

                {openFilter === "sort" &&
                  sortOptions.map((option) => (
                    <button
                      className={draftSortBy === option.value ? "device-filter-option--selected" : ""}
                      key={option.value}
                      type="button"
                      onClick={() => setDraftSortBy(option.value)}
                    >
                      <span>{option.label}</span>
                      {draftSortBy === option.value && <strong>✓</strong>}
                    </button>
                  ))}
              </div>

              <div className="device-filter-popover__actions">
                <button type="button" onClick={resetActiveFilter}>
                  Cancel
                </button>
                <button type="button" onClick={applyActiveFilter}>
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {revocationsOpen && (
          <div className="device-revocations-backdrop" role="presentation">
            <section className="device-revocations-modal" role="dialog" aria-modal="true" aria-label="Revocations">
              <div className="device-revocations-modal__header">
                <h2>REVOCATIONS</h2>
                <label className="device-revocations-search">
                  <span className="sr-only">Search revocations</span>
                  <img src="/assets/search-icon.svg" alt="" aria-hidden="true" />
                  <input
                    type="search"
                    placeholder="Search by key or user..."
                    value={revocationQuery}
                    onChange={(event) => setRevocationQuery(event.target.value)}
                  />
                </label>
                <button type="button" aria-label="Close revocations" onClick={() => setRevocationsOpen(false)} />
              </div>

              <div className="device-revocations-table-wrap">
                <table className="device-revocations-table">
                  <thead>
                    <tr>
                      <th>Serial Key</th>
                      <th>User</th>
                      <th>Company/Department</th>
                      <th>Generated Date</th>
                      <th>Status</th>
                      <th>Reason</th>
                      <th>Revoked by</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRevocations.map((record) => (
                      <tr key={record.recordId}>
                        <td>{record.serialKey}</td>
                        <td>{getUserLabel(record)}</td>
                        <td>{getCompanyDepartment(record)}</td>
                        <td>{formatDate(record.generatedAt ?? record.revokedAt)}</td>
                        <td>
                          <span
                            className={
                              record.requestStatus === "pending"
                                ? "device-revocations-status device-revocations-status--pending"
                                : "device-revocations-status device-revocations-status--revoked"
                            }
                          >
                            {getRevocationStatus(record)}
                          </span>
                        </td>
                        <td>
                          <span className="device-revocations-reason">{getRevocationReason(record)}</span>
                        </td>
                        <td>{getRevokedByLabel(record)}</td>
                        <td>
                          <div className="device-revocations-actions">
                            {record.requestStatus === "pending" ? (
                              <button
                                className="device-revocations-revoke"
                                type="button"
                                onClick={() => void handlePermanentRevoke(record)}
                              >
                                Approve
                              </button>
                            ) : (
                              <button
                                className="device-revocations-revoke"
                                type="button"
                                onClick={() => void handlePermanentRevoke(record)}
                              >
                                Revoke Permanently
                              </button>
                            )}
                            <button
                              className="device-revocations-deny"
                              type="button"
                              onClick={() => void handleDenyRevocation(record)}
                            >
                              Disapprove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {!loadingRevocations && filteredRevocations.length === 0 && (
                      <tr>
                        <td colSpan={8}>
                          <PortalErrorState
                            variant="empty"
                            title="No Revocations Yet"
                            message="Revoked keys and devices will appear here after permanent revocation."
                            compact
                            centered
                            className="portal-error-state--table-cell"
                          />
                        </td>
                      </tr>
                    )}

                    {loadingRevocations && (
                      <tr>
                        <td className="device-revocations-table__empty" colSpan={8}>
                          Loading revocations...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="device-revocations-footer">
                <span>
                  {filteredRevocations.length
                    ? `Showing 1 to ${filteredRevocations.length} of ${filteredRevocations.length} entries`
                    : "Showing 0 entries"}
                </span>
                <button className="device-revocations-refresh" type="button" aria-label="Refresh revocations" onClick={loadRevocations}>
                  <RefreshIcon spinning={loadingRevocations} />
                </button>
              </div>
            </section>
          </div>
        )}
      </main>

      <Modal open={!!revokeTarget} title="Delete device?" onClose={() => setRevokeTarget(null)}>
        <p className="text-sm">
          Delete <strong>{revokeTarget?.deviceName}</strong> from registered devices?
        </p>
        <button
          type="button"
          className="mt-4 w-full rounded-lg bg-red-600 py-2 text-white text-sm"
          onClick={async () => {
            if (!revokeTarget) return;
            try {
              await devicesApi.revoke(revokeTarget.deviceId);
              push("Device revoked", "success");
              setRevokeTarget(null);
              await load();
            } catch (error) {
              push(extractApiError(error, "Failed to revoke device"), "error");
            }
          }}
        >
          Confirm delete
        </button>
      </Modal>
    </>
  );
}
