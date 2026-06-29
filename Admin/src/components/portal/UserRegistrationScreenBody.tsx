import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ModernDatePicker, { EMPTY_DATE_RANGE, type DateRangeValue } from "../ModernDatePicker";
import FilterPickerDropdown from "./FilterPickerDropdown";
import { PortalErrorState } from "./PortalErrorState";
import {
  IconSearch,
} from "../icons/AdminIcons";
import assignedSerialKeysIcon from "../../icons/user-registration-assigned-serial-keys-icon.png";
import registeredUsersIcon from "../../icons/user-registration-registered-users-icon.png";
import activeAccountsIcon from "../../icons/user-registration-active-accounts-icon.png";
import { IconUserMgmtDeactivate, IconUserMgmtEdit } from "../icons/UserManagementIcons";
import {
  USER_REGISTRATION_ASSIGNED_ORGANIZATION,
  USER_REGISTRATION_DEPARTMENTS,
  USER_REGISTRATION_PAGE_SIZE,
  USER_REGISTRATION_STATS,
  buildUserRegistrationCatalogForAssignedOrganization,
  filterUserRegistrationRows,
  type UserRegistrationDepartmentFilter,
  type UserRegistrationRow,
} from "../../data/demoUserRegistration";
import "../../styles/user-registration-screen.css";
import "../../styles/filter-picker-modal.css";

type Props = {
  onRegister?: () => void;
  onEdit?: (row: UserRegistrationRow) => void;
  onDeactivate?: (row: UserRegistrationRow) => void;
  registerHref?: string;
  rows?: UserRegistrationRow[];
  stats?: {
    assignedLicenseKeys: number;
    registeredUsers: number;
    activeAccounts: number;
  };
  assignedOrganization?: string;
  departmentOptions?: Array<{ value: string; label: string }>;
};

function paginationItems(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 4) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  if (current <= 2) {
    return [1, 2, 3, "ellipsis"];
  }

  if (current >= total - 1) {
    return [1, "ellipsis", total - 2, total - 1, total];
  }

  return [1, "ellipsis", current, current + 1, "ellipsis"];
}

function IconChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M9 3.5L5.5 7L9 10.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M5.5 3.5L9 7L5.5 10.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3.25" y="3.25" width="9.5" height="9.5" rx="1" stroke="currentColor" strokeWidth="1.1" />
      <path d="M6 3.25V2.25H10V3.25" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M6 6.25H6.75M6 8.25H6.75M9.25 6.25H10M9.25 8.25H10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function getRegistrationStatusLabel(status: UserRegistrationRow["status"]) {
  switch (status) {
    case "activated":
      return "Activated";
    case "pending-revocation":
      return "Pending Revocation";
    case "revoked":
      return "Revoked";
    default:
      return "Inactive";
  }
}

function getRegistrationStatusClass(status: UserRegistrationRow["status"]) {
  switch (status) {
    case "inactive":
      return "user-registration__status user-registration__status--inactive";
    case "pending-revocation":
      return "user-registration__status user-registration__status--pending-revocation";
    case "revoked":
      return "user-registration__status user-registration__status--revoked";
    default:
      return "user-registration__status";
  }
}

export default function UserRegistrationScreenBody({
  onRegister,
  onEdit,
  onDeactivate,
  registerHref = "/user-management-user-register-modal",
  rows,
  stats,
  assignedOrganization,
  departmentOptions,
}: Props) {
  const catalog = useMemo(
    () => rows ?? buildUserRegistrationCatalogForAssignedOrganization(),
    [rows],
  );
  const organizationName = assignedOrganization ?? USER_REGISTRATION_ASSIGNED_ORGANIZATION.name;
  const registrationStats = stats ?? USER_REGISTRATION_STATS;
  const departments = departmentOptions ?? USER_REGISTRATION_DEPARTMENTS;
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<UserRegistrationDepartmentFilter>("all");
  const [dateRange, setDateRange] = useState<DateRangeValue>(EMPTY_DATE_RANGE);
  const [page, setPage] = useState(1);
  const [departmentPickerOpen, setDepartmentPickerOpen] = useState(false);

  const departmentLabel =
    departments.find((option) => option.value === departmentFilter)?.label ?? "Department";

  useEffect(() => {
    setPage(1);
  }, [searchQuery, departmentFilter, dateRange]);

  const filteredRows = useMemo(
    () => filterUserRegistrationRows(catalog, searchQuery, departmentFilter, dateRange),
    [catalog, searchQuery, departmentFilter, dateRange]
  );

  const totalEntries = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / USER_REGISTRATION_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * USER_REGISTRATION_PAGE_SIZE;
  const pageRows: UserRegistrationRow[] = filteredRows.slice(
    pageStart,
    pageStart + USER_REGISTRATION_PAGE_SIZE
  );
  const showingFrom = totalEntries === 0 ? 0 : pageStart + 1;
  const showingTo = pageStart + pageRows.length;
  const pageNumbers = paginationItems(currentPage, totalPages);

  const goToPage = (nextPage: number) => {
    setPage(Math.min(totalPages, Math.max(1, nextPage)));
  };

  const registerButton = onRegister ? (
    <button type="button" className="user-registration__register-btn" onClick={onRegister}>
      + Register User
    </button>
  ) : (
    <Link to={registerHref} className="user-registration__register-btn">
      + Register User
    </Link>
  );

  return (
    <div className="admin-shell__content user-registration">
      <div className="user-registration__stats">
        <div className="user-registration__stat">
          <span
            className="user-registration__stat-icon user-registration__stat-icon--assigned"
            aria-hidden="true"
          >
            <img src={assignedSerialKeysIcon} alt="" />
          </span>
          <div className="user-registration__stat-content">
            <span className="user-registration__stat-label">Assigned Serial Keys</span>
            <div className="user-registration__stat-value">
              {registrationStats.assignedLicenseKeys.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="user-registration__stat">
          <span
            className="user-registration__stat-icon user-registration__stat-icon--registered"
            aria-hidden="true"
          >
            <img src={registeredUsersIcon} alt="" />
          </span>
          <div className="user-registration__stat-content">
            <span className="user-registration__stat-label">Registered Users</span>
            <div className="user-registration__stat-value">
              {registrationStats.registeredUsers.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="user-registration__stat">
          <span
            className="user-registration__stat-icon user-registration__stat-icon--active"
            aria-hidden="true"
          >
            <img src={activeAccountsIcon} alt="" />
          </span>
          <div className="user-registration__stat-content">
            <span className="user-registration__stat-label">Activated Accounts</span>
            <div className="user-registration__stat-value">
              {registrationStats.activeAccounts.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="user-registration__card">
        <div className="user-registration__toolbar">
          <label className="user-registration__search">
            <IconSearch className="user-registration__search-icon" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search registered users..."
              aria-label="Search registered users"
            />
          </label>

          <div className="user-registration__organization">
            <span className="user-registration__organization-icon" aria-hidden="true">
              <IconBuilding />
            </span>
            <span className="user-registration__organization-label">Organization:</span>
            <input
              type="text"
              className="user-registration__organization-value"
              readOnly
              value={organizationName}
              aria-label="Organization"
              tabIndex={-1}
            />
          </div>

          <FilterPickerDropdown
            title="Select Department"
            options={departments.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
            value={departmentFilter}
            triggerLabel={departmentLabel}
            ariaLabel="Filter by department"
            open={departmentPickerOpen}
            onOpenChange={setDepartmentPickerOpen}
            onApply={(value) => setDepartmentFilter(value as UserRegistrationDepartmentFilter)}
            triggerClassName="user-registration__select"
            showChevron={false}
          />

          <div className="user-registration__date-filter">
            <ModernDatePicker
              value={dateRange}
              onChange={setDateRange}
              ariaLabel="Filter by registration date"
            />
          </div>

          {registerButton}
        </div>

        <div className="user-registration__table-wrap">
          <table className="user-registration__table">
            <colgroup>
              <col className="user-registration__col-name" />
              <col className="user-registration__col-dept" />
              <col className="user-registration__col-key" />
              <col className="user-registration__col-status" />
              <col className="user-registration__col-date" />
              <col className="user-registration__col-actions" />
            </colgroup>
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Serial Key</th>
                <th>Status</th>
                <th>Date Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <PortalErrorState
                      variant="empty"
                      title="No Users Found"
                      message="No registered users match your filters. Adjust search or date filters, or register a new user."
                      compact
                      centered
                      className="portal-error-state--table-cell"
                    />
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="user-registration__name-cell">
                        <span className="user-registration__avatar" aria-hidden="true">
                          {row.initials}
                        </span>
                        <div className="user-registration__name-text">
                          <span className="user-registration__name">{row.name}</span>
                          <span className="user-registration__username">{row.username}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="user-registration__department">{row.department}</span>
                    </td>
                    <td>
                      <span className="user-registration__serial-key">{row.serialKey}</span>
                    </td>
                    <td>
                      <span className={getRegistrationStatusClass(row.status)}>
                        {getRegistrationStatusLabel(row.status)}
                      </span>
                    </td>
                    <td className="user-registration__date">{row.registeredDate}</td>
                    <td>
                      <div className="user-registration__actions">
                        {row.status === "activated" ? (
                          <button
                            type="button"
                            className="user-registration__action-btn user-registration__action-btn--deactivate"
                            aria-label={`Delete ${row.name}`}
                            onClick={() => onDeactivate?.(row)}
                          >
                            <IconUserMgmtDeactivate />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="user-registration__action-btn user-registration__action-btn--edit"
                          aria-label={`Edit ${row.name}`}
                          onClick={() => onEdit?.(row)}
                        >
                          <IconUserMgmtEdit />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="user-registration__footer">
          <span className="user-registration__summary">
            {totalEntries === 0
              ? "Showing 0 registered accounts"
              : `Showing ${showingFrom} to ${showingTo} of ${totalEntries.toLocaleString()} registered accounts`}
          </span>

          <div className="user-registration__pagination">
            <button
              type="button"
              className="user-registration__page-btn"
              aria-label="Previous page"
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              <IconChevronLeft />
            </button>
            {pageNumbers.map((pageNumber, index) =>
              pageNumber === "ellipsis" ? (
                <span key={`ellipsis-${index}`} className="user-registration__page-ellipsis">
                  ...
                </span>
              ) : (
                <button
                  key={pageNumber}
                  type="button"
                  className={`user-registration__page-btn user-registration__page-btn--number${currentPage === pageNumber ? " user-registration__page-btn--active" : ""}`}
                  onClick={() => goToPage(pageNumber)}
                  aria-current={currentPage === pageNumber ? "page" : undefined}
                  aria-label={`Page ${pageNumber}`}
                >
                  {pageNumber}
                </button>
              )
            )}
            <button
              type="button"
              className="user-registration__page-btn"
              aria-label="Next page"
              disabled={currentPage >= totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              <IconChevronRight />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
