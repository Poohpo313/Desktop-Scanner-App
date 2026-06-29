import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { adminsApi } from "../api/admins.api";
import { authApi } from "../api/auth.api";
import { keysApi } from "../api/keys.api";
import { usersApi } from "../api/users.api";
import CalendarDropdown from "../components/CalendarDropdown";
import RegistrationStatCard from "../components/RegistrationStatCard";
import TopBar from "../components/TopBar";
import RegistrationEdit, { type RegistrationEditMode, type RegistrationEditTarget } from "./RegistrationEdit";
import { DeleteAdministratorConfirmModal } from "../components/DeleteAdministratorConfirmModal";
import { RecycleBinConfirmModal } from "../components/RecycleBinConfirmModal";
import type { AdminAccount, AdminUser, SerialKey } from "../types";
import { useNotificationStore } from "../store/notificationStore";
import { formatAccountRegistrationStatus } from "../lib/statusDisplay";
import "../styles/registration.css";

type RegistrationTab = "users" | "administrators";
type FilterPanel = "organization" | "status" | "role";
type OrgDeptStatView = "organizations" | "departments";

const statusOptions = ["active", "inactive"];
const roleOptions = ["Administrator", "Department Admin"];
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

const formatDate = (value?: string) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-CA").format(new Date(value));
};
const toDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
const getTodayDateInputValue = () => toDateValue(new Date());
const getDateParts = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);

  return { year, monthIndex: month - 1, day };
};
const formatDateButtonText = (value: string) => {
  const { year, monthIndex, day } = getDateParts(value);
  if (!year || monthIndex < 0 || !day) return "Select date";

  return `${shortMonthNames[monthIndex]} ${String(day).padStart(2, "0")}, ${year}`;
};

const getFullName = (firstName?: string | null, lastName?: string | null, username?: string) => {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name || username || "-";
};

const getAdminRoleLabel = (roleId?: number | null) => {
  if (roleId === 1) return "Administrator";
  if (roleId === 2) return "Department Admin";
  return "Administrator";
};

const getRecordDepartment = (record: AdminUser | AdminAccount) =>
  ((record as AdminUser & AdminAccount & { department?: string | null }).department ?? "").trim();

const getRecordOrganization = (record: AdminUser | AdminAccount) =>
  ((record as AdminUser & AdminAccount & { company?: string | null; organization?: string | null }).organization ??
    (record as AdminUser & AdminAccount & { company?: string | null; organization?: string | null }).company ??
    "").trim();

export default function AdminManagementPage() {
  const [activeTab, setActiveTab] = useState<RegistrationTab>("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [keys, setKeys] = useState<SerialKey[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
  const [companyOptions, setCompanyOptions] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [openFilter, setOpenFilter] = useState<FilterPanel | null>(null);
  const [organizationFilter, setOrganizationFilter] = useState("");
  const [draftOrganizationFilter, setDraftOrganizationFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [draftDepartmentFilter, setDraftDepartmentFilter] = useState("");
  const [orgDeptStatView, setOrgDeptStatView] = useState<OrgDeptStatView>("organizations");
  const [statusFilter, setStatusFilter] = useState("");
  const [draftStatusFilter, setDraftStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [draftRoleFilter, setDraftRoleFilter] = useState("");
  const [registrationEditMode, setRegistrationEditMode] = useState<RegistrationEditMode | null>(null);
  const [editTarget, setEditTarget] = useState<RegistrationEditTarget | null>(null);
  const [deleteAdminTarget, setDeleteAdminTarget] = useState<AdminAccount | null>(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState<AdminUser | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const push = useNotificationStore((state) => state.push);
  const displayedDate = dateFilter || getTodayDateInputValue();
  const displayedDateParts = getDateParts(displayedDate);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(displayedDateParts.monthIndex);
  const [calendarYear, setCalendarYear] = useState(displayedDateParts.year);
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  const [superAdminContact, setSuperAdminContact] = useState({ email: "", phone: "" });

  useEffect(() => {
    void authApi.me().then((profile) => {
      setSuperAdminContact({
        email: profile.email?.trim() ?? "",
        phone: profile.phoneNumber?.trim() ?? "",
      });
    });
  }, []);

  const loadRegistrationData = async () => {
    const [usersResult, adminsResult, keysResult, departmentsResult, companiesResult] =
      await Promise.allSettled([
        usersApi.list(),
        adminsApi.list(),
        keysApi.list(),
        usersApi.departments(),
        usersApi.companies(),
      ]);

    if (usersResult.status === "fulfilled") {
      setUsers(usersResult.value);
    } else {
      push("Failed to load users", "error");
    }

    if (adminsResult.status === "fulfilled") {
      setAdmins(adminsResult.value);
    } else {
      push("Failed to load administrators", "error");
    }

    if (keysResult.status === "fulfilled") {
      setKeys(keysResult.value);
    }

    if (departmentsResult.status === "fulfilled") {
      setDepartmentOptions(departmentsResult.value);
    }

    if (companiesResult.status === "fulfilled") {
      setCompanyOptions(companiesResult.value);
    }
  };

  useEffect(() => {
    loadRegistrationData();
  }, []);

  const stats = useMemo(() => {
    const activeUsers = users.filter((user) => user.accountStatus === "active").length;
    const activeAdmins = admins.filter((admin) => admin.accountStatus === "active").length;
    const organizations = new Set(
      [...users, ...admins].map((record) => getRecordOrganization(record)).filter(Boolean),
    );
    const departments = new Set(
      [...users, ...admins].map((record) => getRecordDepartment(record)).filter(Boolean),
    );

    return {
      registeredUsers: users.length,
      administrators: admins.length,
      organizations: organizations.size,
      departments: departments.size,
      activeAccounts: activeUsers + activeAdmins,
    };
  }, [admins, users]);

  const organizationDepartmentMap = useMemo(() => {
    const map = new Map<string, Set<string>>();

    for (const record of [...users, ...admins]) {
      const organization = getRecordOrganization(record);
      const department = getRecordDepartment(record);
      if (!organization || !department) continue;
      if (!map.has(organization)) map.set(organization, new Set());
      map.get(organization)?.add(department);
    }

    return map;
  }, [admins, users]);

  const sortedOrganizationOptions = useMemo(
    () => Array.from(organizationDepartmentMap.keys()).sort((a, b) => a.localeCompare(b)),
    [organizationDepartmentMap],
  );

  const sortedDepartmentOptionsForDraftOrg = useMemo(() => {
    if (!draftOrganizationFilter) return [];
    return Array.from(organizationDepartmentMap.get(draftOrganizationFilter) ?? []).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [draftOrganizationFilter, organizationDepartmentMap]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesQuery =
        !normalizedQuery ||
        [user.username, user.firstName, user.lastName, user.email, user.serialKey]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery));
      const matchesOrganization =
        !organizationFilter || getRecordOrganization(user) === organizationFilter;
      const matchesDepartment = !departmentFilter || getRecordDepartment(user) === departmentFilter;
      const matchesStatus = !statusFilter || user.accountStatus === statusFilter;
      const matchesDate = !dateFilter || (user.createdAt ? user.createdAt.slice(0, 10) === dateFilter : false);

      return matchesQuery && matchesOrganization && matchesDepartment && matchesStatus && matchesDate;
    });
  }, [dateFilter, departmentFilter, organizationFilter, query, statusFilter, users]);

  const filteredAdmins = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return admins.filter((admin) => {
      const matchesQuery =
        !normalizedQuery ||
        [admin.username, admin.firstName, admin.lastName, admin.email]
        .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery));
      const matchesOrganization =
        !organizationFilter || getRecordOrganization(admin) === organizationFilter;
      const matchesDepartment = !departmentFilter || getRecordDepartment(admin) === departmentFilter;
      const matchesRole = !roleFilter || getAdminRoleLabel(admin.roleId) === roleFilter;
      const matchesDate = !dateFilter || (admin.createdAt ? admin.createdAt.slice(0, 10) === dateFilter : false);

      return matchesQuery && matchesOrganization && matchesDepartment && matchesRole && matchesDate;
    });
  }, [admins, dateFilter, departmentFilter, organizationFilter, query, roleFilter]);

  const isUsersTab = activeTab === "users";
  const activeRows = isUsersTab ? filteredUsers : filteredAdmins;
  const availableKey =
    keys.find((key) => ["unused", "available"].includes(key.status) && !key.assignedTo) ?? null;
  const closeFilter = () => setOpenFilter(null);
  const openOrganizationFilter = () => {
    setDraftOrganizationFilter(organizationFilter);
    setDraftDepartmentFilter(departmentFilter);
    setOpenFilter("organization");
  };
  const selectDraftOrganization = (organization: string) => {
    setDraftOrganizationFilter(organization);
    setDraftDepartmentFilter("");
  };
  const organizationFilterLabel = organizationFilter
    ? departmentFilter
      ? `${organizationFilter} / ${departmentFilter}`
      : organizationFilter
    : "Organization";
  const openStatusFilter = () => {
    setDraftStatusFilter(statusFilter);
    setOpenFilter("status");
  };
  const openRoleFilter = () => {
    setDraftRoleFilter(roleFilter);
    setOpenFilter("role");
  };
  const resetActiveFilter = () => {
    if (openFilter === "organization") {
      setDraftOrganizationFilter("");
      setDraftDepartmentFilter("");
      setOrganizationFilter("");
      setDepartmentFilter("");
    }
    if (openFilter === "status") {
      setDraftStatusFilter("");
      setStatusFilter("");
    }
    if (openFilter === "role") {
      setDraftRoleFilter("");
      setRoleFilter("");
    }
    closeFilter();
  };
  const applyActiveFilter = () => {
    if (openFilter === "organization") {
      setOrganizationFilter(draftOrganizationFilter);
      setDepartmentFilter(draftDepartmentFilter);
    }
    if (openFilter === "status") setStatusFilter(draftStatusFilter);
    if (openFilter === "role") setRoleFilter(draftRoleFilter);
    closeFilter();
  };
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1);
    const gridStart = new Date(calendarYear, calendarMonth, 1 - firstDayOfMonth.getDay());
    const lastDayOfMonth = new Date(calendarYear, calendarMonth + 1, 0);
    const visibleDayCount = firstDayOfMonth.getDay() + lastDayOfMonth.getDate();
    const totalGridDays = Math.ceil(visibleDayCount / 7) * 7;

    return Array.from({ length: totalGridDays }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);

      return {
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === calendarMonth,
        value: toDateValue(date),
      };
    });
  }, [calendarMonth, calendarYear]);
  const yearOptions = useMemo(
    () => Array.from({ length: 31 }, (_, index) => new Date().getFullYear() - 15 + index),
    [],
  );
  const calendarMonthOptions = useMemo(
    () => monthNames.map((month, index) => ({ label: month, value: index })),
    [],
  );
  const calendarYearOptions = useMemo(
    () => yearOptions.map((year) => ({ label: String(year), value: year })),
    [yearOptions],
  );
  const moveCalendarMonth = (direction: -1 | 1) => {
    const nextMonth = new Date(calendarYear, calendarMonth + direction, 1);
    setCalendarMonth(nextMonth.getMonth());
    setCalendarYear(nextMonth.getFullYear());
  };
  const openCalendar = (event: MouseEvent<HTMLButtonElement>) => {
    const nextParts = getDateParts(displayedDate);
    const rect = event.currentTarget.getBoundingClientRect();
    const calendarWidth = 323;

    setCalendarMonth(nextParts.monthIndex);
    setCalendarYear(nextParts.year);
    setCalendarPosition({
      top: rect.bottom + 10,
      left: Math.max(24, Math.min(rect.right - calendarWidth, window.innerWidth - calendarWidth - 24)),
    });
    setCalendarOpen(true);
  };
  const selectCalendarDate = (value: string) => {
    const nextParts = getDateParts(value);
    setDateFilter(value);
    setCalendarMonth(nextParts.monthIndex);
    setCalendarYear(nextParts.year);
    setCalendarOpen(false);
  };

  const openCreateForm = () => {
    setEditTarget(null);
    setRegistrationEditMode(isUsersTab ? "user" : "administrator");
  };

  const openEditForm = (target: RegistrationEditTarget) => {
    setEditTarget(target);
    setRegistrationEditMode(target.kind);
  };

  const closeRegistrationForm = () => {
    setRegistrationEditMode(null);
    setEditTarget(null);
  };

  const deleteUser = async (user: AdminUser) => {
    setDeleteUserTarget(user);
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserTarget) return;

    try {
      setDeletingUser(true);
      await usersApi.softDelete(deleteUserTarget.userId);
      push("User moved to recycle bin", "success");
      setDeleteUserTarget(null);
      await loadRegistrationData();
    } catch {
      push("Failed to delete user", "error");
    } finally {
      setDeletingUser(false);
    }
  };

  const deleteAdmin = async (admin: AdminAccount) => {
    setDeleteAdminTarget(admin);
  };

  const confirmDeleteAdmin = async () => {
    if (!deleteAdminTarget) return;

    try {
      setDeletingAdmin(true);
      await adminsApi.softDelete(deleteAdminTarget.adminId);
      push("Administrator moved to recycle bin", "success");
      setDeleteAdminTarget(null);
      await loadRegistrationData();
    } catch {
      push("Failed to delete administrator", "error");
    } finally {
      setDeletingAdmin(false);
    }
  };

  return (
    <>
      <TopBar
        title="Desktop Scanner System Administrator Console"
        sectionLabel="Registration"
        sectionActiveLabel={isUsersTab ? "Users" : "Administrator"}
        subtitle="Create, verify, and manage registered users and administrators."
        showLogout={false}
        variant="dashboard"
      />

      <main className="registration-page">
        <section className="registration-stats" aria-label="Registration summary">
          <RegistrationStatCard
            label="Registered Users"
            value={stats.registeredUsers}
            iconSrc="/assets/Add-User.svg"
            iconAlt="Registered users"
          />
          <RegistrationStatCard
            label="Registered Administrators"
            value={stats.administrators}
            iconSrc="/assets/Shield.svg"
            iconAlt="Administrators"
          />
          <RegistrationStatCard
            label={orgDeptStatView === "organizations" ? "Organizations" : "Departments"}
            value={orgDeptStatView === "organizations" ? stats.organizations : stats.departments}
            iconSrc="/assets/ViewingOrganization.svg"
            iconAlt={orgDeptStatView === "organizations" ? "Organizations" : "Departments"}
            toggleable
            toggleAriaLabel={
              orgDeptStatView === "organizations"
                ? "Show department count"
                : "Show organization count"
            }
            onToggle={() =>
              setOrgDeptStatView((current) =>
                current === "organizations" ? "departments" : "organizations",
              )
            }
          />
          <RegistrationStatCard
            label="Activated Users"
            value={stats.activeAccounts}
            iconSrc="/assets/Check.svg"
            iconAlt="Active accounts"
            tone="green"
          />
        </section>

        <section className="registration-card">
          <div className="registration-tabs" role="tablist" aria-label="Registration type">
            <button
              className={`registration-tab${activeTab === "users" ? " registration-tab--active" : ""}`}
              type="button"
              onClick={() => setActiveTab("users")}
            >
              <img src="/assets/User.svg" alt="" aria-hidden="true" />
              <span>Users</span>
            </button>
            <button
              className={`registration-tab${activeTab === "administrators" ? " registration-tab--active" : ""}`}
              type="button"
              onClick={() => setActiveTab("administrators")}
            >
              <img src="/assets/Shield.svg" alt="" aria-hidden="true" />
              <span>Administrators</span>
            </button>
          </div>

          <div className="registration-toolbar">
            <label className="registration-search">
              <span className="sr-only">Search registered accounts</span>
              <img src="/assets/search-icon.svg" alt="" aria-hidden="true" />
              <input
                type="search"
                placeholder={isUsersTab ? "Search registered users..." : "Search administrators..."}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>

            <div className="registration-toolbar__actions">
              <button
                className={
                  organizationFilter || departmentFilter ? "registration-filter-button--active" : ""
                }
                type="button"
                onClick={openOrganizationFilter}
              >
                {organizationFilterLabel}
              </button>
              <button className="registration-date-button" type="button" onClick={openCalendar}>
                <span>{formatDateButtonText(displayedDate)}</span>
                <img src="/assets/Calendar.svg" alt="" aria-hidden="true" />
              </button>
              <button
                className="registration-toolbar__primary"
                type="button"
                onClick={openCreateForm}
              >
                + Register {isUsersTab ? "User" : "Administrator"}
              </button>
            </div>
          </div>

          {calendarOpen && (
            <>
              <div
                className="registration-calendar-backdrop"
                role="presentation"
                onMouseDown={() => setCalendarOpen(false)}
              />
              <div
                className="registration-calendar-popover"
                style={calendarPosition}
                onMouseDown={(event) => event.stopPropagation()}
              >
                <div className="registration-calendar-header">
                  <button type="button" onClick={() => moveCalendarMonth(-1)} aria-label="Previous month">
                    ‹
                  </button>
                  <CalendarDropdown
                    ariaLabel="Month"
                    options={calendarMonthOptions}
                    value={calendarMonth}
                    onChange={setCalendarMonth}
                  />
                  <CalendarDropdown
                    ariaLabel="Year"
                    options={calendarYearOptions}
                    value={calendarYear}
                    onChange={setCalendarYear}
                  />
                  <button type="button" onClick={() => moveCalendarMonth(1)} aria-label="Next month">
                    ›
                  </button>
                </div>
                <div className="registration-calendar-weekdays">
                  {weekdays.map((weekday) => (
                    <span key={weekday}>{weekday}</span>
                  ))}
                </div>
                <div className="registration-calendar-grid">
                  {calendarDays.map((date) => (
                    <button
                      className={[
                        "registration-calendar-day",
                        !date.isCurrentMonth ? "registration-calendar-day--muted" : "",
                        date.value === displayedDate ? "registration-calendar-day--selected" : "",
                      ].filter(Boolean).join(" ")}
                      key={date.value}
                      type="button"
                      onClick={() => selectCalendarDate(date.value)}
                    >
                      {date.day}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="registration-table-wrap">
            <table className={`registration-table ${isUsersTab ? "registration-table--users" : "registration-table--admins"}`}>
              <thead>
                <tr>
                  <th>Name</th>
                  {isUsersTab ? (
                    <>
                      <th>Organization &amp; Department</th>
                      <th>Serial Key</th>
                    </>
                  ) : (
                    <>
                      <th>Organization</th>
                      <th>Department</th>
                    </>
                  )}
                  <th>Status</th>
                  <th>{isUsersTab ? "Date Registered" : "Date Added"}</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isUsersTab &&
                  filteredUsers.map((user) => (
                    <tr key={user.userId}>
                      <td>
                        <strong>{getFullName(user.firstName, user.lastName, user.username)}</strong>
                        <span>{user.username}</span>
                      </td>
                      <td>
                        <strong className="registration-organization">{getRecordOrganization(user) || "-"}</strong>
                        <span>{getRecordDepartment(user) || "-"}</span>
                      </td>
                      <td>{user.serialKey ?? "-"}</td>
                      <td>
                        <span className="registration-status">
                          {formatAccountRegistrationStatus(user.accountStatus)}
                        </span>
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        <div className="registration-actions">
                          <button
                            className="registration-action registration-action--delete"
                            type="button"
                            aria-label="Delete user"
                            onClick={() => void deleteUser(user)}
                          >
                            <span aria-hidden="true">x</span>
                          </button>
                          <button
                            className="registration-action registration-action--edit"
                            type="button"
                            aria-label="Edit user"
                            onClick={() => openEditForm({ kind: "user", record: user })}
                          >
                            <span aria-hidden="true">/</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                {!isUsersTab &&
                  filteredAdmins.map((admin) => (
                    <tr key={admin.adminId}>
                      <td>
                        <strong>{getFullName(admin.firstName, admin.lastName, admin.username)}</strong>
                        <span>{admin.username}</span>
                      </td>
                      <td>{getRecordOrganization(admin) || "-"}</td>
                      <td>{getRecordDepartment(admin) || "-"}</td>
                      <td>
                        <span className="registration-status">{admin.accountStatus}</span>
                      </td>
                      <td>{formatDate(admin.createdAt)}</td>
                      <td>
                        <div className="registration-actions">
                          <button
                            className="registration-action registration-action--delete"
                            type="button"
                            aria-label="Delete administrator"
                            onClick={() => void deleteAdmin(admin)}
                          >
                            <span aria-hidden="true">x</span>
                          </button>
                          <button
                            className="registration-action registration-action--edit"
                            type="button"
                            aria-label="Edit administrator"
                            onClick={() => openEditForm({ kind: "administrator", record: admin })}
                          >
                            <span aria-hidden="true">/</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                {activeRows.length === 0 && (
                  <tr>
                    <td className="registration-table__empty" colSpan={6}>
                      No {isUsersTab ? "registered users" : "administrators"} yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {registrationEditMode && (
          <RegistrationEdit
            availableKey={availableKey}
            departmentOptions={departmentOptions}
            companyOptions={companyOptions}
            mode={registrationEditMode}
            editTarget={editTarget}
            adminContactDefaults={superAdminContact}
            onClose={closeRegistrationForm}
            onRegistered={loadRegistrationData}
          />
        )}

        {deleteAdminTarget ? (
          <DeleteAdministratorConfirmModal
            adminName={getFullName(
              deleteAdminTarget.firstName,
              deleteAdminTarget.lastName,
              deleteAdminTarget.username,
            )}
            deleting={deletingAdmin}
            onCancel={() => {
              if (!deletingAdmin) setDeleteAdminTarget(null);
            }}
            onConfirm={() => void confirmDeleteAdmin()}
          />
        ) : null}

        {deleteUserTarget ? (
          <RecycleBinConfirmModal
            title="Delete User Profile?"
            itemName={getFullName(
              deleteUserTarget.firstName,
              deleteUserTarget.lastName,
              deleteUserTarget.username,
            )}
            deleting={deletingUser}
            onCancel={() => {
              if (!deletingUser) setDeleteUserTarget(null);
            }}
            onConfirm={() => void confirmDeleteUser()}
          />
        ) : null}

        {openFilter && (
          <div className="registration-filter-backdrop" role="presentation">
            <div className="registration-filter-popover" role="dialog" aria-modal="true">
              <div className="registration-filter-popover__header">
                <h2>
                  {openFilter === "organization"
                    ? "Filter by Organization"
                    : openFilter === "status"
                      ? "Filter Status"
                      : "Filter Role"}
                </h2>
                <button type="button" onClick={closeFilter} aria-label="Close filter" />
              </div>

              <div className="registration-filter-options">
                {openFilter === "organization" && (
                  <>
                    <p className="registration-filter-section-label">Organization</p>
                    {sortedOrganizationOptions.map((organization) => (
                      <button
                        className={
                          draftOrganizationFilter === organization
                            ? "registration-filter-option--selected"
                            : ""
                        }
                        key={organization}
                        type="button"
                        onClick={() => selectDraftOrganization(organization)}
                      >
                        <span>{organization}</span>
                        {draftOrganizationFilter === organization && <strong>✓</strong>}
                      </button>
                    ))}

                    {draftOrganizationFilter && (
                      <>
                        <p className="registration-filter-section-label">Department</p>
                        <button
                          className={
                            !draftDepartmentFilter ? "registration-filter-option--selected" : ""
                          }
                          type="button"
                          onClick={() => setDraftDepartmentFilter("")}
                        >
                          <span>All Departments</span>
                          {!draftDepartmentFilter && <strong>✓</strong>}
                        </button>
                        {sortedDepartmentOptionsForDraftOrg.map((department) => (
                          <button
                            className={
                              draftDepartmentFilter === department
                                ? "registration-filter-option--selected"
                                : ""
                            }
                            key={department}
                            type="button"
                            onClick={() => setDraftDepartmentFilter(department)}
                          >
                            <span>{department}</span>
                            {draftDepartmentFilter === department && <strong>✓</strong>}
                          </button>
                        ))}
                      </>
                    )}
                  </>
                )}

                {openFilter === "organization" && sortedOrganizationOptions.length === 0 && (
                  <p className="registration-filter-empty">No organizations found.</p>
                )}

                {openFilter === "status" &&
                  statusOptions.map((status) => (
                    <button
                      className={draftStatusFilter === status ? "registration-filter-option--selected" : ""}
                      key={status}
                      type="button"
                      onClick={() => setDraftStatusFilter(status)}
                    >
                      <span>{status[0].toUpperCase() + status.slice(1)}</span>
                      {draftStatusFilter === status && <strong>✓</strong>}
                    </button>
                  ))}

                {openFilter === "role" &&
                  roleOptions.map((role) => (
                    <button
                      className={draftRoleFilter === role ? "registration-filter-option--selected" : ""}
                      key={role}
                      type="button"
                      onClick={() => setDraftRoleFilter(role)}
                    >
                      <span>{role}</span>
                      {draftRoleFilter === role && <strong>✓</strong>}
                    </button>
                  ))}
              </div>

              <div className="registration-filter-popover__actions">
                <button type="button" onClick={resetActiveFilter}>
                  Reset
                </button>
                <button type="button" onClick={applyActiveFilter}>
                  Apply Filter
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
