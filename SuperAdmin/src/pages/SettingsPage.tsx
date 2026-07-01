import { useEffect, useState } from "react";
import { authApi } from "../api/auth.api";
import { adminsApi } from "../api/admins.api";
import { backupApi } from "../api/backup.api";
import { configApi } from "../api/config.api";
import { keysApi } from "../api/keys.api";
import { usersApi } from "../api/users.api";
import { devicesApi } from "../api/devices.api";
import CalendarDropdown from "../components/CalendarDropdown";
import TopBar from "../components/TopBar";
import { useAuth } from "../hooks/useAuth";
import {
  hasRecycleBinFailures,
  recycleBinResult,
  settleRecycleBinRequest,
} from "../lib/loadRecycleBin";
import { extractApiError } from "../lib/extractApiError";
import {
  loadSuperAdminKnownPin,
  markSuperAdminPinChanged,
  saveSuperAdminKnownPin,
} from "../lib/knownPin";
import { isValidSuperAdminPin } from "../lib/pinDigits";
import SuperAdminPinDigitsField from "../components/SuperAdminPinDigitsField";
import { useNotificationStore } from "../store/notificationStore";
import type { AdminAccount, AdminUser, BackupRecord, Device, SerialKey, SystemConfig } from "../types";
import "../styles/settings.css";

type SettingsTab = "system" | "recycle" | "backup";

const defaultSettings: Partial<SystemConfig> = {
  language: "English",
  timezone: "(GMT+08:00) Asia/Manila",
};

type RecycleSection = "users" | "admins" | "devices" | "keys";

function matchesRecycleSearchAndDate(
  dateValue: string | undefined,
  searchQuery: string,
  filterDate: string,
  searchable: Array<string | null | undefined>,
) {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const matchesQuery =
    !normalizedQuery ||
    searchable.filter(Boolean).some((value) => String(value).toLowerCase().includes(normalizedQuery));
  const matchesDate = !filterDate || dateValue?.slice(0, 10) === filterDate;
  return matchesQuery && matchesDate;
}

const RECYCLE_RETENTION_DAYS = 30;

function getDaysRemaining(deletedAt?: string | null) {
  if (!deletedAt) return RECYCLE_RETENTION_DAYS;
  const deletedTime = new Date(deletedAt).getTime();
  if (Number.isNaN(deletedTime)) return RECYCLE_RETENTION_DAYS;
  const purgeAt = deletedTime + RECYCLE_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((purgeAt - Date.now()) / (24 * 60 * 60 * 1000)));
}

const formatRecycleDate = (value?: string) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const getDisplayName = (record: AdminAccount | AdminUser) => {
  const fullName = [record.firstName, record.lastName].filter(Boolean).join(" ").trim();
  return fullName || record.username;
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const shortMonthNames = monthNames.map((month) => month.slice(0, 3));
const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const toDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getDateParts = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return { year, monthIndex: month - 1, day };
};

const formatDateButtonText = (value: string) => {
  const { year, monthIndex, day } = getDateParts(value);
  if (!year || monthIndex < 0 || !day) return "Select date";

  return `${shortMonthNames[monthIndex]} ${day}, ${year}`;
};

function buildSuperAdminProfilePayload(profile: {
  fullName: string;
  email: string;
  phoneNumber: string;
}) {
  const nameParts = profile.fullName.trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0]?.trim();
  const lastName = nameParts.slice(1).join(" ").trim();
  const payload: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
  } = {};

  if (firstName) payload.firstName = firstName;
  if (lastName) payload.lastName = lastName;

  const email = profile.email.trim();
  if (email) payload.email = email;

  const phoneNumber = profile.phoneNumber.trim();
  if (phoneNumber) payload.phoneNumber = phoneNumber;

  return payload;
}


export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("system");
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountSaveError, setAccountSaveError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [settings, setSettings] = useState<Partial<SystemConfig>>(defaultSettings);
  const [deletedAdmins, setDeletedAdmins] = useState<AdminAccount[]>([]);
  const [deletedUsers, setDeletedUsers] = useState<AdminUser[]>([]);
  const [deletedDevices, setDeletedDevices] = useState<Device[]>([]);
  const [deletedKeys, setDeletedKeys] = useState<
    Array<{
      serialId: number;
      serialKey: string;
      company?: string | null;
      department?: string | null;
      revokedAt?: string;
    }>
  >([]);
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [recycleQuery, setRecycleQuery] = useState("");
  const [recycleDate, setRecycleDate] = useState("");
  const selectedRecycleDateParts = getDateParts(recycleDate);
  const [recycleCalendarOpen, setRecycleCalendarOpen] = useState(false);
  const [recycleCalendarMonth, setRecycleCalendarMonth] = useState(selectedRecycleDateParts.monthIndex);
  const [recycleCalendarYear, setRecycleCalendarYear] = useState(selectedRecycleDateParts.year);
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(true);
  const [activityLogsEnabled, setActivityLogsEnabled] = useState(true);
  const [backupDailyEnabled, setBackupDailyEnabled] = useState(true);
  const [runningBackup, setRunningBackup] = useState(false);
  const [profile, setProfile] = useState({
    fullName: "Bukolabs",
    email: "info@bukolabs.io",
    phoneNumber: "+639171225214",
    username: "Superadmin",
    role: "System Administrator",
    currentPassword: loadSuperAdminKnownPin(),
    newPassword: "",
  });
  const { logout } = useAuth();
  const push = useNotificationStore((state) => state.push);

  useEffect(() => {
    if (!successOpen) return;
    const timer = window.setTimeout(() => setSuccessOpen(false), 3000);
    return () => window.clearTimeout(timer);
  }, [successOpen]);

  useEffect(() => {
    if (!accountOpen) {
      setAccountSaveError(null);
      return;
    }
    const knownPin = loadSuperAdminKnownPin();
    setProfile((current) => ({
      ...current,
      currentPassword: knownPin,
      newPassword: "",
    }));
    setShowCurrentPassword(false);
  }, [accountOpen]);

  const activeSettingsLabel: Record<SettingsTab, string> = {
    system: "System Configuration",
    recycle: "Recycle Bin",
    backup: "Backup Management",
  };
  const recycleCalendarDays = Array.from(
    {
      length: Math.ceil(
        (new Date(recycleCalendarYear, recycleCalendarMonth, 1).getDay() +
          new Date(recycleCalendarYear, recycleCalendarMonth + 1, 0).getDate()) /
          7,
      ) * 7,
    },
    (_, index) => {
      const firstDayOfMonth = new Date(recycleCalendarYear, recycleCalendarMonth, 1);
      const gridStart = new Date(
        recycleCalendarYear,
        recycleCalendarMonth,
        1 - firstDayOfMonth.getDay(),
      );
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);

      return {
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === recycleCalendarMonth,
        value: toDateValue(date),
      };
    },
  );
  const recycleCalendarYearOptions = Array.from(
    { length: 31 },
    (_, index) => new Date().getFullYear() - 15 + index,
  ).map((year) => ({ label: String(year), value: year }));
  const recycleCalendarMonthOptions = monthNames.map((month, index) => ({ label: month, value: index }));
  const moveRecycleCalendarMonth = (direction: -1 | 1) => {
    const nextMonth = new Date(recycleCalendarYear, recycleCalendarMonth + direction, 1);
    setRecycleCalendarMonth(nextMonth.getMonth());
    setRecycleCalendarYear(nextMonth.getFullYear());
  };
  const selectRecycleDate = (value: string) => {
    const nextParts = getDateParts(value);
    setRecycleDate(value);
    setRecycleCalendarMonth(nextParts.monthIndex);
    setRecycleCalendarYear(nextParts.year);
    setRecycleCalendarOpen(false);
  };

  useEffect(() => {
    authApi
      .me()
      .then((profile) => {
        const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
        setProfile((current) => ({
          ...current,
          fullName: fullName || profile.username,
          email: profile.email ?? current.email,
          phoneNumber: profile.phoneNumber ?? current.phoneNumber,
          username: profile.username,
        }));
      })
      .catch(() => {
        /* keep fallback profile */
      });
  }, []);

  useEffect(() => {
    configApi
      .get()
      .then((config) => {
        setSettings({
          ...defaultSettings,
          ...config,
          language: config.language || defaultSettings.language,
          timezone: config.timezone || defaultSettings.timezone,
        });
        setBackupDailyEnabled(config.backupDailyEnabled !== false);
      })
      .catch(() => {
        /* keep fallback settings until backend config is available */
      });
  }, []);

  const loadRecycleBin = () => {
    void (async () => {
      const [adminResult, userResult, deviceResult, keyResult] = await Promise.all([
        settleRecycleBinRequest(adminsApi.recycleBin(), [] as AdminAccount[]),
        settleRecycleBinRequest(usersApi.recycleBin(), [] as AdminUser[]),
        settleRecycleBinRequest(devicesApi.recycleBin(), [] as Device[]),
        settleRecycleBinRequest(keysApi.recycleBin(), [] as SerialKey[]),
      ]);

      setDeletedAdmins(recycleBinResult(adminResult, []));
      setDeletedUsers(recycleBinResult(userResult, []));
      setDeletedDevices(recycleBinResult(deviceResult, []));
      setDeletedKeys(recycleBinResult(keyResult, []));

      if (hasRecycleBinFailures([adminResult, userResult, deviceResult, keyResult])) {
        push("Some recycle bin sections could not be loaded.", "error");
      }
    })();
  };

  useEffect(() => {
    loadRecycleBin();
  }, []);

  const loadBackups = () => {
    backupApi
      .history()
      .then(setBackups)
      .catch(() => {
        /* keep empty backup history until backend is available */
      });
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const updateConfig = async (nextSettings: Partial<SystemConfig>) => {
    setSettings((current) => ({ ...current, ...nextSettings }));

    try {
      await configApi.patch(nextSettings);
      push("Settings updated", "success");
    } catch {
      push("Settings will sync when backend is available", "error");
    }
  };

  const filteredDeletedUsers = deletedUsers.filter((user) =>
    matchesRecycleSearchAndDate(
      (user as AdminUser & { deletedAt?: string }).deletedAt ?? user.createdAt,
      recycleQuery,
      recycleDate,
      [getDisplayName(user), user.username, user.serialKey, user.email],
    ),
  );

  const filteredDeletedAdmins = deletedAdmins.filter((admin) =>
    matchesRecycleSearchAndDate(
      admin.deletedAt ?? admin.createdAt,
      recycleQuery,
      recycleDate,
      [getDisplayName(admin), admin.username, admin.email],
    ),
  );

  const filteredDeletedDevices = deletedDevices.filter((device) =>
    matchesRecycleSearchAndDate(
      device.lastSeen ?? undefined,
      recycleQuery,
      recycleDate,
      [device.deviceName, device.serialNumber, device.deviceType],
    ),
  );

  const filteredDeletedKeys = deletedKeys.filter((key) =>
    matchesRecycleSearchAndDate(
      key.revokedAt,
      recycleQuery,
      recycleDate,
      [key.serialKey, key.company, key.department],
    ),
  );

  const restoreRecycleItem = async (
    type: RecycleSection,
    id: number,
    label: string,
  ) => {
    try {
      if (type === "admins") await adminsApi.restore(id);
      else if (type === "devices") await devicesApi.restore(id);
      else if (type === "keys") await keysApi.restoreRevokedKey(id);
      else await usersApi.restore(id);
      push(`${label} restored`, "success");
      loadRecycleBin();
    } catch {
      push("Failed to restore item", "error");
    }
  };

  const deleteRecycleItem = async (type: RecycleSection, id: number) => {
    try {
      if (type === "admins") await adminsApi.permanentDelete(id);
      else if (type === "devices") await devicesApi.permanentDelete(id);
      else if (type === "keys") await keysApi.permanentDelete(id);
      else await usersApi.permanentDelete(id);
      push("Permanently deleted", "success");
      loadRecycleBin();
    } catch (error) {
      push(extractApiError(error, "Failed to delete item"), "error");
    }
  };

  const failedBackups = backups.filter((backup) => backup.status?.toLowerCase() === "failed").length;
  const lastBackup = backups[0] ?? null;

  const restoreBackup = async (backup: BackupRecord) => {
    try {
      await backupApi.restore(backup.id);
      push("Backup restored", "success");
      loadBackups();
    } catch {
      push("Failed to restore backup", "error");
    }
  };

  const toggleDailyBackup = async (enabled: boolean) => {
    setBackupDailyEnabled(enabled);
    try {
      const updated = await configApi.patch({ backupDailyEnabled: enabled });
      setSettings((current) => ({ ...current, ...updated }));
      push(enabled ? "Daily backup enabled" : "Daily backup disabled", "success");
    } catch {
      setBackupDailyEnabled(!enabled);
      push("Failed to update backup schedule", "error");
    }
  };

  const runManualBackup = async () => {
    try {
      setRunningBackup(true);
      await backupApi.manual();
      await loadBackups();
      push("Manual backup started", "success");
    } catch {
      push("Failed to run backup", "error");
    } finally {
      setRunningBackup(false);
    }
  };

  return (
    <>
      <TopBar
        title="Desktop Scanner System Administrator Console"
        sectionLabel="Settings"
        sectionActiveLabel={activeSettingsLabel[activeTab]}
        subtitle="Configure system preferences, and security."
        showLogout={false}
        variant="dashboard"
      >
        <div className="settings-profile">
          <div className="settings-profile__avatar" aria-hidden="true" />
          <div>
            <strong>{profile.fullName}</strong>
            <span>System Administrator</span>
          </div>
          <button type="button" aria-label="Open account settings" onClick={() => setAccountOpen(true)} />
        </div>
      </TopBar>

      <main className="settings-page">
        <aside className="settings-rail" aria-label="Settings sections">
          <button
            className={activeTab === "system" ? "settings-rail__item settings-rail__item--active" : "settings-rail__item"}
            type="button"
            onClick={() => setActiveTab("system")}
          >
            System Configuration
          </button>
          <button
            className={activeTab === "recycle" ? "settings-rail__item settings-rail__item--active" : "settings-rail__item"}
            type="button"
            onClick={() => setActiveTab("recycle")}
          >
            Recycle Bin
          </button>
          <button
            className={activeTab === "backup" ? "settings-rail__item settings-rail__item--active" : "settings-rail__item"}
            type="button"
            onClick={() => setActiveTab("backup")}
          >
            Backup Management
          </button>
        </aside>

        <section className="settings-content">
          {activeTab === "system" && (
            <>
              <h2>System Configuration</h2>
              <p>Manage system policies</p>

              <div className="settings-policy-group">
                <span>System Policies</span>
                <label>
                  <input
                    type="checkbox"
                    checked={cloudSyncEnabled}
                    onChange={(event) => setCloudSyncEnabled(event.target.checked)}
                  />
                  <strong>Enable Cloud Sync</strong>
                  <small>Allow files to sync with cloud storage</small>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={activityLogsEnabled}
                    onChange={(event) => setActivityLogsEnabled(event.target.checked)}
                  />
                  <strong>Enable Activity Logs</strong>
                  <small>Record user and device activities</small>
                </label>
              </div>
            </>
          )}

          {activeTab === "recycle" && (
            <div className="settings-recycle">
              <h2>Recycle Bin</h2>
              <p>
                View and manage all deleted items. Items in the recycle bin will be permanently deleted after{" "}
                <strong>30 days.</strong>
              </p>

              <div className="settings-recycle-filters">
                <button
                  className="settings-recycle-date-button"
                  type="button"
                  onClick={() => {
                    const nextParts = recycleDate
                      ? getDateParts(recycleDate)
                      : getDateParts(toDateValue(new Date()));
                    setRecycleCalendarMonth(nextParts.monthIndex);
                    setRecycleCalendarYear(nextParts.year);
                    setRecycleCalendarOpen(true);
                  }}
                >
                  <span>{recycleDate ? formatDateButtonText(recycleDate) : "All dates"}</span>
                  <img src="/assets/Calendar.svg" alt="" aria-hidden="true" />
                </button>
                {recycleDate ? (
                  <button type="button" className="settings-recycle-clear-date" onClick={() => setRecycleDate("")}>
                    Clear date
                  </button>
                ) : null}
                <label>
                  <img src="/assets/search-icon.svg" alt="" aria-hidden="true" />
                  <input
                    type="search"
                    placeholder="Search..."
                    value={recycleQuery}
                    onChange={(event) => setRecycleQuery(event.target.value)}
                  />
                </label>
              </div>

              <div className="settings-recycle-stats" aria-label="Recycle bin summary">
                <article>
                  <img src="/assets/DeletedUserProfile.svg" alt="" aria-hidden="true" />
                  <div>
                    <span>Deleted User Profile</span>
                    <strong>{filteredDeletedUsers.length}</strong>
                  </div>
                </article>
                <article>
                  <img src="/assets/DeletedAdministratorProfile.svg" alt="" aria-hidden="true" />
                  <div>
                    <span>Deleted Administrator Profile</span>
                    <strong>{filteredDeletedAdmins.length}</strong>
                  </div>
                </article>
                <article>
                  <img src="/assets/DeletedDevice.svg" alt="" aria-hidden="true" />
                  <div>
                    <span>Deleted Device</span>
                    <strong>{filteredDeletedDevices.length}</strong>
                  </div>
                </article>
                <article>
                  <img src="/assets/DeletedUserProfile.svg" alt="" aria-hidden="true" />
                  <div>
                    <span>Revoked Serial Keys</span>
                    <strong>{filteredDeletedKeys.length}</strong>
                  </div>
                </article>
              </div>

              <div className="settings-recycle-sections">
                <section className="settings-recycle-section">
                  <h3>Deleted User Profiles ({filteredDeletedUsers.length})</h3>
                  <div className="settings-recycle-table-wrap">
                    <table className="settings-recycle-table">
                      <thead>
                        <tr>
                          <th>Profile Name</th>
                          <th>Username</th>
                          <th>Serial Key</th>
                          <th>Date Deleted</th>
                          <th>Days Remaining</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDeletedUsers.map((user) => {
                          const deletedAt = (user as AdminUser & { deletedAt?: string }).deletedAt;
                          return (
                            <tr key={`user-${user.userId}`}>
                              <td>{getDisplayName(user)}</td>
                              <td>{user.username}</td>
                              <td>{user.serialKey ?? "-"}</td>
                              <td>{formatRecycleDate(deletedAt ?? user.createdAt)}</td>
                              <td>
                                <span className="settings-recycle-days">{getDaysRemaining(deletedAt)} Days</span>
                              </td>
                              <td>
                                <div className="settings-recycle-actions">
                                  <button type="button" onClick={() => void restoreRecycleItem("users", user.userId, "User profile")}>
                                    Restore
                                  </button>
                                  <button type="button" onClick={() => void deleteRecycleItem("users", user.userId)}>
                                    Delete Permanently
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {filteredDeletedUsers.length === 0 && (
                          <tr>
                            <td className="settings-recycle-empty" colSpan={6}>No deleted user profiles.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="settings-recycle-section">
                  <h3>Deleted Administrators ({filteredDeletedAdmins.length})</h3>
                  <div className="settings-recycle-table-wrap">
                    <table className="settings-recycle-table">
                      <thead>
                        <tr>
                          <th>Profile Name</th>
                          <th>Username</th>
                          <th>Date Deleted</th>
                          <th>Days Remaining</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDeletedAdmins.map((admin) => (
                          <tr key={`admin-${admin.adminId}`}>
                            <td>{getDisplayName(admin)}</td>
                            <td>{admin.username}</td>
                            <td>{formatRecycleDate(admin.deletedAt ?? admin.createdAt)}</td>
                            <td>
                              <span className="settings-recycle-days">{getDaysRemaining(admin.deletedAt)} Days</span>
                            </td>
                            <td>
                              <div className="settings-recycle-actions">
                                <button type="button" onClick={() => void restoreRecycleItem("admins", admin.adminId, "Administrator")}>
                                  Restore
                                </button>
                                <button type="button" onClick={() => void deleteRecycleItem("admins", admin.adminId)}>
                                  Delete Permanently
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredDeletedAdmins.length === 0 && (
                          <tr>
                            <td className="settings-recycle-empty" colSpan={5}>No deleted administrators.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="settings-recycle-section">
                  <h3>Deleted Devices ({filteredDeletedDevices.length})</h3>
                  <div className="settings-recycle-table-wrap">
                    <table className="settings-recycle-table">
                      <thead>
                        <tr>
                          <th>Device Name</th>
                          <th>Serial Number</th>
                          <th>Date Deleted</th>
                          <th>Days Remaining</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDeletedDevices.map((device) => (
                          <tr key={`device-${device.deviceId}`}>
                            <td>{device.deviceName ?? "Workstation"}</td>
                            <td>{device.serialNumber ?? "-"}</td>
                            <td>{formatRecycleDate(device.lastSeen ?? undefined)}</td>
                            <td>
                              <span className="settings-recycle-days">{getDaysRemaining(device.lastSeen)} Days</span>
                            </td>
                            <td>
                              <div className="settings-recycle-actions">
                                <button type="button" onClick={() => void restoreRecycleItem("devices", device.deviceId, "Device")}>
                                  Restore
                                </button>
                                <button type="button" onClick={() => void deleteRecycleItem("devices", device.deviceId)}>
                                  Delete Permanently
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredDeletedDevices.length === 0 && (
                          <tr>
                            <td className="settings-recycle-empty" colSpan={5}>No deleted devices.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="settings-recycle-section">
                  <h3>Revoked Serial Keys ({filteredDeletedKeys.length})</h3>
                  <p className="settings-recycle-section__hint">
                    Unassigned serial keys revoked before they were linked to a user account.
                  </p>
                  <div className="settings-recycle-table-wrap">
                    <table className="settings-recycle-table">
                      <thead>
                        <tr>
                          <th>Serial Key</th>
                          <th>Company</th>
                          <th>Department</th>
                          <th>Date Revoked</th>
                          <th>Days Remaining</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDeletedKeys.map((key) => (
                          <tr key={`key-${key.serialId}`}>
                            <td>{key.serialKey}</td>
                            <td>{key.company ?? "-"}</td>
                            <td>{key.department ?? "-"}</td>
                            <td>{formatRecycleDate(key.revokedAt)}</td>
                            <td>
                              <span className="settings-recycle-days">{getDaysRemaining(key.revokedAt)} Days</span>
                            </td>
                            <td>
                              <div className="settings-recycle-actions">
                                <button type="button" onClick={() => void restoreRecycleItem("keys", key.serialId, "Serial key")}>
                                  Restore
                                </button>
                                <button type="button" onClick={() => void deleteRecycleItem("keys", key.serialId)}>
                                  Delete Permanently
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredDeletedKeys.length === 0 && (
                          <tr>
                            <td className="settings-recycle-empty" colSpan={6}>No revoked unassigned serial keys.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              <div className="settings-recycle-footer">
                <span>
                  {`Users ${filteredDeletedUsers.length} · Admins ${filteredDeletedAdmins.length} · Devices ${filteredDeletedDevices.length} · Keys ${filteredDeletedKeys.length}`}
                </span>
              </div>
            </div>
          )}

          {activeTab === "backup" && (
            <div className="settings-backup">
              <h2>Backup Management</h2>
              <p>View backup history, trigger manual backups, and restore data.</p>

              <div className="settings-backup-schedule">
                <label>
                  <input
                    type="checkbox"
                    checked={backupDailyEnabled}
                    onChange={(event) => void toggleDailyBackup(event.target.checked)}
                  />
                  <div>
                    <strong>Automatic backup per day</strong>
                    <small>Runs a full system backup every day at 2:00 AM</small>
                  </div>
                </label>
                <button
                  className="settings-backup-run"
                  type="button"
                  disabled={runningBackup}
                  onClick={() => void runManualBackup()}
                >
                  {runningBackup ? "Running..." : "Run Backup Now"}
                </button>
              </div>

              <div className="settings-backup-stats" aria-label="Backup summary">
                <article>
                  <img src="/assets/TotalBackup.svg" alt="" aria-hidden="true" />
                  <div>
                    <span>Total Backups</span>
                    <strong>{backups.length}</strong>
                  </div>
                </article>
                <article>
                  <img src="/assets/LastBackup.svg" alt="" aria-hidden="true" />
                  <div>
                    <span>Last Backup</span>
                    <strong>{lastBackup ? formatRecycleDate(lastBackup.createdAt) : "-"}</strong>
                  </div>
                </article>
                <article>
                  <img src="/assets/FailedBackup.svg" alt="" aria-hidden="true" />
                  <div>
                    <span>Failed Backups</span>
                    <strong>{failedBackups}</strong>
                  </div>
                </article>
              </div>

              <div className="settings-backup-table-wrap">
                <table className="settings-backup-table">
                  <thead>
                    <tr>
                      <th>Backup Name</th>
                      <th>Type</th>
                      <th>Date created</th>
                      <th>Size</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backups.map((backup) => {
                      const status = backup.status ?? "success";

                      return (
                        <tr key={backup.id}>
                          <td>{backup.version}</td>
                          <td>{backup.version.toLowerCase().includes("manual") ? "Manual" : "Automatic"}</td>
                          <td>{formatRecycleDate(backup.createdAt)}</td>
                          <td>{backup.sizeMb ? `${(backup.sizeMb / 1024).toFixed(1)} GB` : "-"}</td>
                          <td>
                            <span className={`settings-backup-status settings-backup-status--${status.toLowerCase()}`}>
                              {status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="settings-backup-restore"
                              type="button"
                              disabled={status.toLowerCase() === "failed"}
                              onClick={() => restoreBackup(backup)}
                            >
                              Restore
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {backups.length === 0 && (
                      <tr>
                        <td className="settings-backup-empty" colSpan={6}>
                          No backup history found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="settings-backup-footer">
                <span>
                  {backups.length ? `Showing 1 to ${backups.length} of ${backups.length} entries` : "Showing 0 entries"}
                </span>
              </div>
            </div>
          )}
        </section>
      </main>

      {accountOpen && (
        <div className="settings-account-backdrop" role="presentation">
          <section className="settings-account-modal" role="dialog" aria-modal="true" aria-label="Super Admin Account Setting">
            <div className="settings-account-modal__header">
              <h2>Super Admin Account Setting</h2>
              <button type="button" aria-label="Close account settings" onClick={() => setAccountOpen(false)} />
            </div>

            <div className="settings-account-photo">
              <div className="settings-account-photo__avatar" aria-hidden="true" />
              <button type="button">Change Photo</button>
            </div>

            <div className="settings-account-form">
              {accountSaveError ? (
                <p className="settings-account-form__error" role="alert">
                  {accountSaveError}
                </p>
              ) : null}
              <div className="settings-account-form__left">
                <h3>Profile</h3>
                <label>
                  <span>Fullname</span>
                  <input
                    value={profile.fullName}
                    onChange={(event) => setProfile((current) => ({ ...current, fullName: event.target.value }))}
                  />
                </label>
                <label>
                  <span>Email Address (Default Gmail)</span>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))}
                  />
                </label>
                <label>
                  <span>Phone Number</span>
                  <input
                    value={profile.phoneNumber}
                    onChange={(event) => setProfile((current) => ({ ...current, phoneNumber: event.target.value }))}
                  />
                </label>

                <h3>Account Information</h3>
                <label>
                  <span>Username</span>
                  <input
                    value={profile.username}
                    onChange={(event) => setProfile((current) => ({ ...current, username: event.target.value }))}
                  />
                </label>
                <label>
                  <span>Role</span>
                  <input value={profile.role} readOnly />
                  <small>Role cannot be changed</small>
                </label>
              </div>

              <div className="settings-account-form__right">
                <h3>Change PIN</h3>
                <p className="settings-account-pin-note">PIN must be exactly 6 digits.</p>
                <SuperAdminPinDigitsField
                  label="Current PIN"
                  hint="Locked — use Show to view your current PIN"
                  value={profile.currentPassword}
                  readOnly
                  visible={showCurrentPassword}
                  onToggleVisible={() => setShowCurrentPassword((current) => !current)}
                />
                <SuperAdminPinDigitsField
                  label="New PIN"
                  hint="Enter a new 6-digit PIN"
                  value={profile.newPassword}
                  visible={showNewPassword}
                  onToggleVisible={() => setShowNewPassword((current) => !current)}
                  onChange={(nextPin) =>
                    setProfile((current) => ({ ...current, newPassword: nextPin }))
                  }
                />
              </div>
            </div>

            <div className="settings-account-modal__footer">
              <button className="settings-account-signout" type="button" onClick={logout}>
                Sign Out
              </button>
              <button
                className="settings-account-reset"
                type="button"
                onClick={() =>
                  setProfile((current) => ({
                    ...current,
                    currentPassword: loadSuperAdminKnownPin(),
                    newPassword: "",
                  }))
                }
              >
                Reset
              </button>
              <button className="settings-account-cancel" type="button" onClick={() => setAccountOpen(false)}>
                Cancel
              </button>
              <button
                className="settings-account-save"
                type="button"
                onClick={async () => {
                  setAccountSaveError(null);

                  try {
                    await authApi.updateProfile(buildSuperAdminProfilePayload(profile));
                  } catch (error) {
                    const message = extractApiError(error, "Failed to save account profile");
                    setAccountSaveError(message);
                    push(message, "error");
                    return;
                  }

                  const changingPin = profile.newPassword.trim().length > 0;

                  if (changingPin) {
                    if (!isValidSuperAdminPin(profile.currentPassword)) {
                      const message = "Current PIN must be exactly 6 digits";
                      setAccountSaveError(message);
                      push(message, "error");
                      return;
                    }

                    if (!isValidSuperAdminPin(profile.newPassword)) {
                      const message = "New PIN must be exactly 6 digits";
                      setAccountSaveError(message);
                      push(message, "error");
                      return;
                    }

                    if (profile.currentPassword === profile.newPassword) {
                      const message = "New PIN must be different from your current PIN";
                      setAccountSaveError(message);
                      push(message, "error");
                      return;
                    }

                    try {
                      await authApi.changePin({
                        currentPin: profile.currentPassword,
                        newPin: profile.newPassword,
                      });
                      saveSuperAdminKnownPin(profile.newPassword);
                      markSuperAdminPinChanged();
                    } catch (error) {
                      const message = extractApiError(error, "Failed to update PIN");
                      setAccountSaveError(message);
                      push(message, "error");
                      return;
                    }
                  }

                  setProfile((current) => ({
                    ...current,
                    currentPassword: changingPin ? profile.newPassword : loadSuperAdminKnownPin(),
                    newPassword: "",
                  }));
                  setAccountOpen(false);
                  setSuccessOpen(true);
                }}
              >
                Save Changes
              </button>
            </div>
          </section>
        </div>
      )}

      {recycleCalendarOpen && (
        <div className="settings-calendar-backdrop" role="presentation" onMouseDown={() => setRecycleCalendarOpen(false)}>
          <section
            className="settings-calendar-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Choose recycle bin date"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="settings-calendar-header">
              <button type="button" onClick={() => moveRecycleCalendarMonth(-1)} aria-label="Previous month">
                ‹
              </button>
              <CalendarDropdown
                ariaLabel="Month"
                options={recycleCalendarMonthOptions}
                value={recycleCalendarMonth}
                onChange={setRecycleCalendarMonth}
              />
              <CalendarDropdown
                ariaLabel="Year"
                options={recycleCalendarYearOptions}
                value={recycleCalendarYear}
                onChange={setRecycleCalendarYear}
              />
              <button type="button" onClick={() => moveRecycleCalendarMonth(1)} aria-label="Next month">
                ›
              </button>
            </div>

            <div className="settings-calendar-weekdays">
              {weekdays.map((weekday) => (
                <span key={weekday}>{weekday}</span>
              ))}
            </div>

            <div className="settings-calendar-grid">
              {recycleCalendarDays.map((date) => (
                <button
                  className={[
                    "settings-calendar-day",
                    !date.isCurrentMonth ? "settings-calendar-day--muted" : "",
                    date.value === recycleDate ? "settings-calendar-day--selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={date.value}
                  type="button"
                  onClick={() => selectRecycleDate(date.value)}
                >
                  {date.day}
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {successOpen && (
        <div className="settings-success-backdrop" role="presentation">
          <section className="settings-success-modal" role="dialog" aria-modal="true" aria-label="Successfully saved">
            <div className="settings-success-icon" aria-hidden="true">
              ✓
            </div>
            <h2>Account settings changed successfully</h2>
            <button type="button" onClick={() => setSuccessOpen(false)}>
              OK
            </button>
          </section>
        </div>
      )}

    </>
  );
}
