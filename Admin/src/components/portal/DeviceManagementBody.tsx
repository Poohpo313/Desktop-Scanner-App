import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { AdminUser, Device } from "../../types";
import FilterPickerDropdown from "./FilterPickerDropdown";
import PortalOverlay from "./PortalOverlay";
import CheckDeviceStatusModal from "./CheckDeviceStatusModal";
import MonitorDeviceModal from "./MonitorDeviceModal";
import NotifySuperAdminModal from "./NotifySuperAdminModal";
import RetryConnectionModal from "./RetryConnectionModal";
import ReportIssueModal from "./ReportIssueModal";
import { useNotificationStore } from "../../store/notificationStore";
import {
  displayDeviceStatus,
  deviceStatusPillClass,
  getDeviceNetworkIdentity,
  mapApiDeviceInternet,
  mapApiDeviceStatus,
  type DemoDeviceRow,
  type DeviceTypeVariant,
} from "../../data/demoDevices";
import { getEllipsisDirection, getPaginationJumpTarget, renderPaginationEllipsis } from "../../utils/paginationDisplay";
import AnimatedPanel from "../AnimatedPanel";
import "../../styles/portal-pages.css";
import "../../styles/portal-modal.css";
import "../../styles/device-management.css";
import "../../styles/check-device-status-modal.css";
import "../../styles/monitor-device-modal.css";
import "../../styles/notify-super-admin-modal.css";
import "../../styles/retry-connection-modal.css";
import "../../styles/report-issue-modal.css";
import "../../styles/filter-picker-modal.css";

const PAGE_SIZE = 3;

type Row = DemoDeviceRow & { raw?: Device };

type DeviceModalRow = {
  id: string;
  name: string;
  networkIdentity: string;
};

type RetryModalRow = {
  id: string;
  name: string;
  typeVariant: DeviceTypeVariant;
};

type Props = {
  variant?: "figma" | "portal";
  devices?: Device[];
  users?: AdminUser[];
  onBlock?: (device: Device) => void;
  onProvision?: () => void;
};

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "unauthorized", label: "Unauthorized" },
] as const;

type StatusFilter = (typeof STATUS_FILTER_OPTIONS)[number]["value"];

function paginationItems(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 5) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, "ellipsis", total];
  }

  if (current >= total - 2) {
    return [1, "ellipsis", total - 2, total - 1, total];
  }

  return [1, "ellipsis", current, "ellipsis", total];
}

function formatRows(devices?: Device[], users?: AdminUser[]): Row[] {
  if (!devices?.length) {
    return [];
  }

  const userMap = new Map(users?.map((user) => [user.userId, user]) ?? []);

  return devices.map((device) => {
    const assignee = device.assignedUser ? userMap.get(device.assignedUser) : undefined;
    const userName = assignee
      ? `${assignee.firstName ?? ""} ${assignee.lastName ?? ""}`.trim() || assignee.username
      : "Unknown Guest";
    const status = mapApiDeviceStatus(device.status);
    const typeVariant: DeviceTypeVariant =
      device.deviceType?.toLowerCase().includes("output") ? "output" : "peripheral";

    return {
      id: String(device.serialNumber ?? device.deviceId),
      name: device.deviceName ?? "Unknown",
      type: device.deviceType ?? (typeVariant === "output" ? "Output Device" : "Peripheral"),
      typeVariant,
      user: userName,
      status,
      internet: mapApiDeviceInternet(status),
      raw: device,
    };
  });
}

function IconChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconFilter({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2.5 4.25H13.5M4.75 8H11.25M6.75 11.75H9.25"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconPlus({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 2.5V11.5M2.5 7H11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconConnected({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M8.25 7.75C5.85 7.75 4.25 9.35 4.25 11C4.25 12.65 5.85 14.25 8.25 14.25"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.75 7.75C16.15 7.75 17.75 9.35 17.75 11C17.75 12.65 16.15 14.25 13.75 14.25"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9.75 11H12.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconActive({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M11.75 3.5L7 11.75H10.25L7.5 18.5L15 10H11.75L11.75 3.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconInactive({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7.25" stroke="currentColor" strokeWidth="1.75" />
      <rect x="8.35" y="8.1" width="1.8" height="5.8" rx="0.4" fill="currentColor" />
      <rect x="11.85" y="8.1" width="1.8" height="5.8" rx="0.4" fill="currentColor" />
    </svg>
  );
}

function IconUnauthorized({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M11 5.75L16.4 16.25H5.6L11 5.75Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M11 9.5V12.75" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="11" cy="14.6" r="0.95" fill="currentColor" />
    </svg>
  );
}

function IconPeripheral({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 7H10M6 9.5H8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconOutput({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="4" y="2.5" width="8" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 12.5H10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconInternet({ status }: { status: DemoDeviceRow["internet"] }) {
  if (status === "connected") {
    return (
      <span className="device-mgmt-internet device-mgmt-internet--connected" aria-label="Connected">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path
            d="M2.5 9C4.5 6.5 7 5.25 9 5.25C11 5.25 13.5 6.5 15.5 9M5 11.75C6.25 10.25 7.5 9.5 9 9.5C10.5 9.5 11.75 10.25 13 11.75M7.75 14.25C8.25 13.75 8.75 13.5 9 13.5C9.25 13.5 9.75 13.75 10.25 14.25"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }

  if (status === "disconnected") {
    return (
      <span className="device-mgmt-internet device-mgmt-internet--disconnected" aria-label="Disconnected">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path
            d="M2.5 9C4.5 6.5 7 5.25 9 5.25C11 5.25 13.5 6.5 15.5 9M5 11.75C6.25 10.25 7.5 9.5 9 9.5C10.5 9.5 11.75 10.25 13 11.75"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
          <path d="M3.5 3.5L14.5 14.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      </span>
    );
  }

  return (
    <span className="device-mgmt-internet device-mgmt-internet--blocked" aria-label="Blocked">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path
          d="M2.5 9C4.5 6.5 7 5.25 9 5.25C11 5.25 13.5 6.5 15.5 9"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <circle cx="9" cy="13.75" r="1" fill="currentColor" />
        <path d="M3.5 3.5L14.5 14.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function IconEye() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M1.5 7C2.8 4.6 4.8 3.25 7 3.25C9.2 3.25 11.2 4.6 12.5 7C11.2 9.4 9.2 10.75 7 10.75C4.8 10.75 2.8 9.4 1.5 7Z"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <circle cx="7" cy="7" r="1.75" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

function IconMonitor() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="10" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.1" />
      <path d="M5.5 11.5H8.5M7 9.5V11.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg className="device-mgmt-action__icon device-mgmt-action__icon--compact" width="14" height="14" viewBox="2.5 5.25 11 6.75" fill="none" aria-hidden="true">
      <path
        d="M5.2 9.05V6.45A2.8 2.8 0 0 1 10.8 6.45V9.05"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="3.1" y="8.9" width="9.8" height="1.65" rx="0.825" fill="currentColor" />
      <path d="M6.75 10.55A1.25 1.25 0 0 0 9.25 10.55Z" fill="currentColor" />
    </svg>
  );
}

function IconRetry() {
  return (
    <svg className="device-mgmt-action__icon device-mgmt-action__icon--compact" width="14" height="14" viewBox="3.25 4.25 9.5 7.5" fill="none" aria-hidden="true">
      <path
        d="M11.2 5.35A4.2 4.2 0 0 0 4.8 5.35"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M4.35 5.95L4.8 5.35L5.25 5.95"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M4.8 10.65A4.2 4.2 0 0 0 11.2 10.65"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M10.75 10.05L11.2 10.65L11.65 10.05"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function IconBlock() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.75" stroke="currentColor" strokeWidth="1.1" />
      <path d="M3.75 3.75L10.25 10.25" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function IconReport() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M4 2.5H8.5L10.5 4.5V11.5H4V2.5Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M8.5 2.5V4.5H10.5M6 7H8.5M6 9H8.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function TypeIcon({ variant }: { variant: DeviceTypeVariant }) {
  return variant === "output" ? <IconOutput className="device-mgmt-table__type-icon" /> : <IconPeripheral className="device-mgmt-table__type-icon" />;
}

export default function DeviceManagementBody({
  variant = "figma",
  devices,
  users,
  onBlock,
  onProvision,
}: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [pageChanging, setPageChanging] = useState(false);
  const [statusModalRow, setStatusModalRow] = useState<DeviceModalRow | null>(null);
  const [monitorModalRow, setMonitorModalRow] = useState<DeviceModalRow | null>(null);
  const [notifyModalRow, setNotifyModalRow] = useState<Pick<DeviceModalRow, "id" | "name"> | null>(null);
  const [retryModalRow, setRetryModalRow] = useState<RetryModalRow | null>(null);
  const [reportModalRow, setReportModalRow] = useState<Pick<DeviceModalRow, "id" | "name"> | null>(null);
  const push = useNotificationStore((s) => s.push);

  useEffect(() => {
    const routeState = location.state as {
      checkStatus?: DeviceModalRow;
      monitorDevice?: DeviceModalRow;
      notifyAdmin?: Pick<DeviceModalRow, "id" | "name">;
      retryConnection?: RetryModalRow;
      reportIssue?: Pick<DeviceModalRow, "id" | "name">;
    } | null;
    if (routeState?.checkStatus) {
      setStatusModalRow(routeState.checkStatus);
      navigate(location.pathname, { replace: true, state: null });
      return;
    }
    if (routeState?.monitorDevice) {
      setMonitorModalRow(routeState.monitorDevice);
      navigate(location.pathname, { replace: true, state: null });
      return;
    }
    if (routeState?.notifyAdmin) {
      setNotifyModalRow(routeState.notifyAdmin);
      navigate(location.pathname, { replace: true, state: null });
      return;
    }
    if (routeState?.retryConnection) {
      setRetryModalRow(routeState.retryConnection);
      navigate(location.pathname, { replace: true, state: null });
      return;
    }
    if (routeState?.reportIssue) {
      setReportModalRow(routeState.reportIssue);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const toDeviceModalRow = (row: Row): DeviceModalRow => ({
    id: row.id,
    name: row.name,
    networkIdentity: getDeviceNetworkIdentity(row.id, row.name),
  });

  const openStatusModal = (row: Row) => {
    setStatusModalRow(toDeviceModalRow(row));
  };

  const openMonitorModal = (row: Row) => {
    setMonitorModalRow(toDeviceModalRow(row));
  };

  const openNotifyModal = (row: Row) => {
    setNotifyModalRow({ id: row.id, name: row.name });
  };

  const openRetryModal = (row: Row) => {
    setRetryModalRow({ id: row.id, name: row.name, typeVariant: row.typeVariant });
  };

  const openReportModal = (row: Row) => {
    setReportModalRow({ id: row.id, name: row.name });
  };

  const rows = formatRows(devices, users);

  const stats = useMemo(() => {
    const list = rows;
    return {
      connected: list.length,
      active: list.filter((row) => row.status === "active").length,
      inactive: list.filter((row) => row.status === "inactive").length,
      unauthorized: list.filter((row) => row.status === "unauthorized").length,
    };
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (statusFilter === "all") return rows;
    return rows.filter((row) => row.status === statusFilter);
  }, [rows, statusFilter]);

  const displayTotal = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(displayTotal / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pageRows = filteredRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const pageNumbers = paginationItems(currentPage, totalPages);
  const activeFilterLabel = STATUS_FILTER_OPTIONS.find((option) => option.value === statusFilter)?.label ?? "Filters";

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const goToPage = (nextPage: number) => {
    if (nextPage === currentPage) return;
    setPageChanging(true);
    window.setTimeout(() => {
      setPage(nextPage);
      setPageChanging(false);
    }, 120);
  };

  const handlePaginationJump = (direction: "forward" | "backward") => {
    goToPage(getPaginationJumpTarget(currentPage, totalPages, direction));
  };

  const renderActionButton = (
    label: string,
    className: string,
    icon: ReactNode,
    onClick?: () => void,
    href?: string,
  ) => {
    if (href) {
      return (
        <Link to={href} className={`device-mgmt-action ${className}`}>
          {icon}
          {label}
        </Link>
      );
    }

    return (
      <button type="button" className={`device-mgmt-action ${className}`} onClick={onClick}>
        {icon}
        {label}
      </button>
    );
  };

  const renderActions = (row: Row) => {
    const useFigmaLinks = variant === "figma" || !row.raw;

    if (row.status === "active") {
      return (
        <>
          {renderActionButton("View", "device-mgmt-action--primary", <IconEye />, () => openStatusModal(row))}
          {renderActionButton("Monitor", "device-mgmt-action--secondary", <IconMonitor />, () => openMonitorModal(row))}
        </>
      );
    }

    if (row.status === "inactive") {
      return (
        <>
          {renderActionButton("Notify", "device-mgmt-action--primary", <IconBell />, () => openNotifyModal(row))}
          {renderActionButton("Retry", "device-mgmt-action--secondary", <IconRetry />, () => openRetryModal(row))}
        </>
      );
    }

    return (
      <>
        {row.raw && onBlock
          ? renderActionButton("Block", "device-mgmt-action--danger", <IconBlock />, () => onBlock(row.raw!))
          : useFigmaLinks
            ? renderActionButton("Block", "device-mgmt-action--danger", <IconBlock />, undefined, "/notify-super-admin-modal")
            : null}
        {renderActionButton("Report", "device-mgmt-action--secondary", <IconReport />, () => openReportModal(row))}
      </>
    );
  };

  const renderProvisionButton = () => {
    if (variant === "portal" && onProvision) {
      return (
        <button type="button" className="device-mgmt-provision-btn" onClick={onProvision}>
          <IconPlus className="device-mgmt-provision-btn__icon" />
          Provision Device
        </button>
      );
    }

    if (variant === "figma") {
      return (
        <Link to="/provision-device" className="device-mgmt-provision-btn">
          <IconPlus className="device-mgmt-provision-btn__icon" />
          Provision Device
        </Link>
      );
    }

    return null;
  };

  return (
    <div className="admin-shell__content device-mgmt">
      <div className="device-mgmt-stats">
        <div className="device-mgmt-stat">
          <div className="device-mgmt-stat__icon device-mgmt-stat__icon--connected">
            <IconConnected />
          </div>
          <div>
            <div className="device-mgmt-stat__label">Connected</div>
            <div className="device-mgmt-stat__value">{stats.connected.toLocaleString()}</div>
          </div>
        </div>
        <div className="device-mgmt-stat">
          <div className="device-mgmt-stat__icon device-mgmt-stat__icon--active">
            <IconActive />
          </div>
          <div>
            <div className="device-mgmt-stat__label">Active</div>
            <div className="device-mgmt-stat__value">{stats.active.toLocaleString()}</div>
          </div>
        </div>
        <div className="device-mgmt-stat">
          <div className="device-mgmt-stat__icon device-mgmt-stat__icon--inactive">
            <IconInactive />
          </div>
          <div>
            <div className="device-mgmt-stat__label">Inactive</div>
            <div className="device-mgmt-stat__value">{stats.inactive.toLocaleString()}</div>
          </div>
        </div>
        <div className="device-mgmt-stat">
          <div className="device-mgmt-stat__icon device-mgmt-stat__icon--unauthorized">
            <IconUnauthorized />
          </div>
          <div>
            <div className="device-mgmt-stat__label">Unauthorized</div>
            <div className="device-mgmt-stat__value">{stats.unauthorized.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="portal-table-card device-mgmt-table-card">
        <div className="portal-table-card__header">
          <span className="portal-table-card__title">Device Inventory</span>
          <div className="device-mgmt-table-card__actions">
            <div className="device-mgmt-filter-wrap">
              <FilterPickerDropdown
                title="Select Status"
                options={STATUS_FILTER_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                value={statusFilter}
                triggerLabel={activeFilterLabel}
                ariaLabel="Filter devices by status"
                open={filterOpen}
                onOpenChange={setFilterOpen}
                onApply={setStatusFilter}
                triggerClassName="device-mgmt-filter-btn"
                triggerPrefix={<IconFilter className="device-mgmt-filter-btn__icon" />}
                showChevron={false}
                dropdownAlign="right"
              />
            </div>
            {renderProvisionButton()}
          </div>
        </div>

        <AnimatedPanel
          transitionKey={`${currentPage}-${statusFilter}-${pageChanging ? "loading" : "ready"}`}
          className={pageChanging ? " page-transition--loading" : ""}
        >
          <table className="portal-table device-mgmt-table">
            <thead>
              <tr>
                <th>Device ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>User</th>
                <th>Status</th>
                <th>Internet</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="portal-table-empty">
                    No devices match your filter
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => (
                  <tr key={`${row.id}-${row.name}`}>
                    <td className="device-mgmt-table__id">{row.id}</td>
                    <td className="device-mgmt-table__name">{row.name}</td>
                    <td>
                      <span className="device-mgmt-table__type">
                        <TypeIcon variant={row.typeVariant} />
                        {row.type}
                      </span>
                    </td>
                    <td>{row.user}</td>
                    <td>
                      <span className={`device-mgmt-pill device-mgmt-pill--${deviceStatusPillClass(row.status)}`}>
                        {displayDeviceStatus(row.status)}
                      </span>
                    </td>
                    <td>
                      <IconInternet status={row.internet} />
                    </td>
                    <td>
                      <div className="device-mgmt-table__actions">{renderActions(row)}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </AnimatedPanel>

        <div className="device-mgmt-table-footer">
          <span className="device-mgmt-table-footer__summary">
            Showing {pageRows.length.toLocaleString()} of {displayTotal.toLocaleString()} devices
          </span>
          <div className="device-mgmt-pagination">
            <button
              type="button"
              className="device-mgmt-pagination__arrow"
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
              aria-label="Previous page"
            >
              <IconChevronLeft />
            </button>
            {pageNumbers.map((pageNumber, index) =>
              pageNumber === "ellipsis" ? (
                renderPaginationEllipsis(
                  `device-ellipsis-${index}`,
                  getEllipsisDirection(pageNumbers, index),
                  handlePaginationJump,
                  "device-mgmt-pagination__page",
                )
              ) : (
                <button
                  key={pageNumber}
                  type="button"
                  className={`device-mgmt-pagination__page${pageNumber === currentPage ? " device-mgmt-pagination__page--active" : ""}`}
                  onClick={() => goToPage(pageNumber)}
                  aria-current={pageNumber === currentPage ? "page" : undefined}
                >
                  {pageNumber}
                </button>
              ),
            )}
            <button
              type="button"
              className="device-mgmt-pagination__arrow"
              disabled={currentPage >= totalPages}
              onClick={() => goToPage(currentPage + 1)}
              aria-label="Next page"
            >
              <IconChevronRight />
            </button>
          </div>
        </div>
      </div>

      <PortalOverlay open={!!statusModalRow} onClose={() => setStatusModalRow(null)}>
        {statusModalRow ? (
          <CheckDeviceStatusModal
            key={`${statusModalRow.id}-${statusModalRow.networkIdentity}`}
            onClose={() => setStatusModalRow(null)}
            deviceName={statusModalRow.name}
            networkIdentity={statusModalRow.networkIdentity}
          />
        ) : null}
      </PortalOverlay>

      <PortalOverlay open={!!monitorModalRow} onClose={() => setMonitorModalRow(null)}>
        {monitorModalRow ? (
          <MonitorDeviceModal
            key={`${monitorModalRow.id}-${monitorModalRow.networkIdentity}`}
            onClose={() => setMonitorModalRow(null)}
            deviceName={monitorModalRow.name}
            networkIdentity={monitorModalRow.networkIdentity}
          />
        ) : null}
      </PortalOverlay>

      <PortalOverlay open={!!notifyModalRow} onClose={() => setNotifyModalRow(null)}>
        {notifyModalRow ? (
          <NotifySuperAdminModal
            key={notifyModalRow.id}
            onClose={() => setNotifyModalRow(null)}
            deviceName={notifyModalRow.name}
            onSend={() => push("Super Admin notified about device issue", "success")}
          />
        ) : null}
      </PortalOverlay>

      <PortalOverlay open={!!retryModalRow} onClose={() => setRetryModalRow(null)}>
        {retryModalRow ? (
          <RetryConnectionModal
            key={retryModalRow.id}
            onClose={() => setRetryModalRow(null)}
            deviceName={retryModalRow.name}
            deviceType={retryModalRow.typeVariant}
            onRetry={() => push("Retry connection started", "success")}
          />
        ) : null}
      </PortalOverlay>

      <PortalOverlay open={!!reportModalRow} onClose={() => setReportModalRow(null)}>
        {reportModalRow ? (
          <ReportIssueModal
            key={reportModalRow.id}
            onClose={() => setReportModalRow(null)}
            deviceName={reportModalRow.name}
            onSend={() => push("Issue report submitted", "success")}
          />
        ) : null}
      </PortalOverlay>
    </div>
  );
}
