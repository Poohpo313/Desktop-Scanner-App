import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { AdminUser } from "../../types";
import { portalUserDetailPath } from "../../routes/portalPaths";
import { demoRowToAdminUser, figmaUserDetailPath } from "../../data/demoUsers";
import { filterUserListRows } from "../../data/filterUserList";
import { exportUsersListCsv } from "../../data/exportUsersList";
import { useNotificationStore } from "../../store/notificationStore";
import AnimatedPanel from "../AnimatedPanel";
import { IconExportUsers, IconRefreshList, IconSearch, IconUserManagementRegister } from "../icons/AdminIcons";
import { IconUserMgmtDeactivate, IconUserMgmtEdit, IconUserMgmtView } from "../icons/UserManagementIcons";
import { brandColors } from "../../theme/brand";
import "../../styles/portal-pages.css";
import "../../styles/user-management.css";
import "../../styles/page-transition.css";

const FIGMA_EDIT_USER_ROUTE = "/user-management-edit-user-modal";
const PAGE_SIZE = 4;

type Row = {
  id: string | number;
  username: string;
  name: string;
  key: string;
  status: "active" | "inactive";
  avatar: string;
  registeredAt: string;
  raw?: AdminUser;
};

type Props = {
  variant?: "figma" | "portal";
  users?: AdminUser[];
  search?: string;
  onSearchChange?: (value: string) => void;
  onRegister?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onExport?: () => void;
  onView?: (user: AdminUser) => void;
  onEdit?: (user: AdminUser) => void;
  onToggleStatus?: (user: AdminUser, status: "active" | "inactive") => void | Promise<void>;
};

function avatarForUser(_user: AdminUser, _index: number): string {
  return "";
}

function formatRows(users: AdminUser[] | undefined): Row[] {
  return (users ?? []).map((u, index) => ({
    id: u.userId,
    username: u.username,
    name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.username,
    key: u.serialKey ?? "—",
    status: u.accountStatus === "active" ? "active" : "inactive",
    avatar: avatarForUser(u, index),
    registeredAt: u.createdAt ? new Date(u.createdAt).toLocaleString() : "Recently",
    raw: u,
  }));
}

function paginationWindow(current: number, total: number): number[] {
  if (total <= 1) return [1];
  if (total === 2) return [1, 2];
  const start = Math.min(Math.max(current, 1), total - 1);
  return [start, start + 1];
}

function computeStats(users: AdminUser[] | undefined) {
  const list = users ?? [];
  const active = list.filter((u) => u.accountStatus === "active").length;
  const assigned = list.filter((u) => u.serialKey).length;
  const pending = list.filter((u) => u.accountStatus === "pending" || u.accountStatus === "inactive").length;

  return {
    total: list.length,
    active,
    assigned,
    pending,
    inactive: list.length - active,
  };
}

export default function UserManagementBody({
  variant = "figma",
  users,
  search = "",
  onSearchChange,
  onRegister,
  onRefresh,
  refreshing: refreshingProp,
  onExport,
  onView,
  onEdit,
  onToggleStatus,
}: Props) {
  const navigate = useNavigate();
  const push = useNotificationStore((s) => s.push);
  const [page, setPage] = useState(1);
  const [localSearch, setLocalSearch] = useState("");
  const [statusOverrides, setStatusOverrides] = useState<Record<string, "active" | "inactive">>({});
  const [refreshingList, setRefreshingList] = useState(false);
  const [exportingUsers, setExportingUsers] = useState(false);
  const [pageChanging, setPageChanging] = useState(false);
  const isSearchControlled = onSearchChange !== undefined;
  const searchQuery = isSearchControlled ? search : localSearch;
  const isFiltering = searchQuery.trim().length > 0;
  const isRefreshingList = refreshingProp ?? refreshingList;
  const rows = formatRows(users);
  const stats = computeStats(users);
  const activePct = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;
  const registerHref = variant === "portal" ? undefined : "/user-management-user-register-modal";

  useEffect(() => {
    if (variant === "portal") {
      setStatusOverrides({});
    }
  }, [users, variant]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const goToPage = (nextPage: number) => {
    if (nextPage === page) return;
    setPageChanging(true);
    window.setTimeout(() => {
      setPage(nextPage);
      setPageChanging(false);
    }, 120);
  };

  const getRowStatus = (row: Row): "active" | "inactive" =>
    statusOverrides[String(row.id)] ?? row.status;

  const filteredRows = useMemo(() => filterUserListRows(rows, searchQuery), [rows, searchQuery]);

  const displayTotal = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filteredRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const pageNumbers = paginationWindow(currentPage, totalPages);

  const donutData = [
    { name: "Active", value: stats.active, color: brandColors.persianGreen },
    { name: "Inactive", value: stats.inactive, color: brandColors.danger },
  ];

  const registerLabel = (
    <>
      <IconUserManagementRegister className="user-mgmt-register-icon" />
      Register User
    </>
  );

  const resolveUser = (row: Row): AdminUser => (row.raw ? row.raw : demoRowToAdminUser(row));

  const handleView = (row: Row) => {
    if (variant === "figma") {
      navigate(figmaUserDetailPath(row.id));
      return;
    }
    if (row.raw && onView) {
      onView(row.raw);
      return;
    }
    navigate(portalUserDetailPath(row.id));
  };

  const handleEdit = (row: Row) => {
    const user = resolveUser(row);
    if (onEdit) {
      onEdit(user);
      return;
    }
    if (variant === "figma") {
      navigate(FIGMA_EDIT_USER_ROUTE);
    }
  };

  const buildExportUsers = (): AdminUser[] =>
    filteredRows.map((row) => {
      const user = resolveUser(row);
      const override = statusOverrides[String(row.id)];
      return override ? { ...user, accountStatus: override } : user;
    });

  const handleSearchChange = (value: string) => {
    if (isSearchControlled) {
      onSearchChange?.(value);
      return;
    }

    setLocalSearch(value);
  };

  const handleRefreshList = async () => {
    if (isRefreshingList) return;

    setPage(1);

    if (onRefresh && refreshingProp !== undefined) {
      onRefresh();
      return;
    }

    setRefreshingList(true);

    try {
      if (onRefresh) {
        await Promise.resolve(onRefresh());
      } else {
        await new Promise((resolve) => window.setTimeout(resolve, 700));
        push("User list refreshed", "success");
      }
    } catch {
      push("Refresh failed", "error");
    } finally {
      window.setTimeout(() => setRefreshingList(false), 300);
    }
  };

  const handleExportUsers = async () => {
    if (exportingUsers) return;

    setExportingUsers(true);

    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => resolve());
    });

    try {
      if (onExport) {
        onExport();
      } else {
        exportUsersListCsv(buildExportUsers());
        push("Users exported to CSV", "success");
      }
    } catch {
      push("Export failed", "error");
    } finally {
      window.setTimeout(() => setExportingUsers(false), 400);
    }
  };

  const handleDeactivate = async (row: Row) => {
    const rowKey = String(row.id);

    setStatusOverrides((prev) => ({ ...prev, [rowKey]: "inactive" }));

    try {
      if (onToggleStatus) {
        await onToggleStatus(resolveUser(row), "inactive");
      }
      push("User deactivated", "success");
    } catch {
      setStatusOverrides((prev) => {
        const next = { ...prev };
        delete next[rowKey];
        return next;
      });
      push("Status update failed", "error");
    }
  };

  return (
    <div className="admin-shell__content">
      <div className="portal-page__toolbar">
        <p className="user-mgmt-desc">Manage registered users and assigned serial keys...</p>
        <div className="portal-page__actions">
          {onRegister ? (
            <button type="button" className="figma-btn figma-btn--primary" onClick={onRegister}>
              {registerLabel}
            </button>
          ) : registerHref ? (
            <Link to={registerHref} className="figma-btn figma-btn--primary">
              {registerLabel}
            </Link>
          ) : (
            <button type="button" className="figma-btn figma-btn--primary" disabled>
              {registerLabel}
            </button>
          )}
          <button
            type="button"
            className={`figma-btn figma-btn--secondary${isRefreshingList ? " user-mgmt-action-btn--loading" : ""}`}
            onClick={() => void handleRefreshList()}
            disabled={isRefreshingList}
            aria-busy={isRefreshingList}
          >
            <IconRefreshList
              className={`user-mgmt-refresh-icon${isRefreshingList ? " user-mgmt-action-icon--spinning" : ""}`}
            />
            {isRefreshingList ? "Refreshing..." : "Refresh List"}
          </button>
          <button
            type="button"
            className={`figma-btn figma-btn--secondary${exportingUsers ? " user-mgmt-action-btn--loading" : ""}`}
            onClick={() => void handleExportUsers()}
            disabled={exportingUsers}
            aria-busy={exportingUsers}
          >
            <IconExportUsers
              className={`user-mgmt-export-icon${exportingUsers ? " user-mgmt-action-icon--spinning" : ""}`}
            />
            {exportingUsers ? "Exporting..." : "Export Users"}
          </button>
        </div>
      </div>

      <div className="user-mgmt-stats">
        <div className="dash-stat">
          <div className="dash-stat__label">Total Users</div>
          <div className="dash-stat__value">{stats.total.toLocaleString()}</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat__label">Active Users</div>
          <div className="dash-stat__value">{stats.active.toLocaleString()}</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat__label">Assigned Keys</div>
          <div className="dash-stat__value">{stats.assigned.toLocaleString()}</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat__label">Pending Verification</div>
          <div className="dash-stat__value">{stats.pending.toLocaleString()}</div>
        </div>
      </div>

      <div className="portal-page-grid">
        <div className="portal-table-card">
          <div className="portal-table-card__header">
            <span className="portal-table-card__title">Users List</span>
            <label className="user-mgmt-table-filter">
              <IconSearch className="user-mgmt-table-filter__icon" />
              <input
                type="search"
                className="user-mgmt-table-filter__input"
                placeholder="Filter by username, name, or key..."
                value={searchQuery}
                onChange={(event) => handleSearchChange(event.target.value)}
                aria-label="Filter users"
              />
            </label>
          </div>
          <AnimatedPanel
            transitionKey={`${currentPage}-${searchQuery}-${pageChanging ? "loading" : "ready"}`}
            className={`user-mgmt-table-panel${pageChanging ? " page-transition--loading" : ""}`}
          >
          <table className="portal-table user-mgmt-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Username</th>
                <th>Full Name</th>
                <th>Assigned Key</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="portal-table-empty">
                    {isFiltering ? "No users match your filter" : "No users found"}
                  </td>
                </tr>
              ) : (
                pageRows.map((u, i) => {
                  const rowStatus = getRowStatus(u);
                  const isActive = rowStatus === "active";

                  return (
                  <tr key={u.id}>
                    <td>{(currentPage - 1) * PAGE_SIZE + i + 1}</td>
                    <td>{u.username}</td>
                    <td>{u.name}</td>
                    <td>{u.key}</td>
                    <td>
                      <span className={`portal-pill portal-pill--${isActive ? "active" : "inactive"}`}>
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="portal-table__actions">
                      <button
                        type="button"
                        className="user-mgmt-table__icon-btn user-mgmt-table__icon-btn--view"
                        aria-label={`View ${u.username}`}
                        onClick={() => handleView(u)}
                      >
                        <IconUserMgmtView />
                      </button>
                      <button
                        type="button"
                        className="user-mgmt-table__icon-btn user-mgmt-table__icon-btn--edit"
                        aria-label={`Edit ${u.username}`}
                        onClick={() => handleEdit(u)}
                      >
                        <IconUserMgmtEdit />
                      </button>
                      {isActive ? (
                        <button
                          type="button"
                          className="user-mgmt-table__icon-btn user-mgmt-table__icon-btn--danger"
                          aria-label={`Deactivate ${u.username}`}
                          onClick={() => void handleDeactivate(u)}
                        >
                          <IconUserMgmtDeactivate />
                        </button>
                      ) : null}
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
          </AnimatedPanel>
          <div className="user-mgmt-table-footer">
            <span>
              Showing {pageRows.length.toLocaleString()} of {displayTotal.toLocaleString()} users
            </span>
            <div className="user-mgmt-pagination">
              <button
                type="button"
                className="user-mgmt-pagination__btn"
                disabled={currentPage <= 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                Previous
              </button>
              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  className={`user-mgmt-pagination__page${currentPage === pageNumber ? " user-mgmt-pagination__page--active" : ""}`}
                  onClick={() => goToPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                type="button"
                className="user-mgmt-pagination__btn"
                disabled={currentPage >= totalPages}
                onClick={() => goToPage(currentPage + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="portal-side-card">
            <div className="portal-side-card__title">User Status Analytics</div>
            <div className="user-mgmt-analytics">
              <div className="user-mgmt-donut-wrap">
                <ResponsiveContainer width="100%" height={148}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={66}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {donutData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="user-mgmt-donut-center">
                  <span className="user-mgmt-donut-center__value">{activePct}%</span>
                  <span className="user-mgmt-donut-center__label">Active</span>
                </div>
              </div>
              <div className="user-mgmt-legend">
                <div className="user-mgmt-legend__item">
                  <span className="user-mgmt-legend__dot user-mgmt-legend__dot--active" aria-hidden="true" />
                  <span>
                    Active ({stats.active.toLocaleString()} users)
                  </span>
                </div>
                <div className="user-mgmt-legend__item">
                  <span className="user-mgmt-legend__dot user-mgmt-legend__dot--inactive" aria-hidden="true" />
                  <span>
                    Inactive ({stats.inactive.toLocaleString()} users)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="portal-side-card">
            <div className="portal-side-card__title">Recent Registrations</div>
            {rows.slice(0, 3).map((u) => (
              <div key={u.id} className="user-mgmt-recent-item">
                <img className="user-mgmt-recent-item__avatar" src={u.avatar} alt="" />
                <div className="user-mgmt-recent-item__body">
                  <div className="user-mgmt-recent-item__name">{u.name}</div>
                  <div className="user-mgmt-recent-item__key">KEY: {u.key}</div>
                </div>
                <div className="user-mgmt-recent-item__time">{u.registeredAt}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
