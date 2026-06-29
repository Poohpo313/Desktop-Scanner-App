import { useEffect, useMemo, useState } from "react";
import totalDevicesIcon from "../../icons/device-catalog-total-devices-icon.png";
import activeDevicesIcon from "../../icons/device-catalog-active-devices-icon.png";
import inactiveDevicesIcon from "../../icons/device-catalog-inactive-devices-icon.png";
import FilterPickerDropdown from "./FilterPickerDropdown";
import PortalOverlay from "./PortalOverlay";
import DeviceDeleteRequestModal from "./DeviceDeleteRequestModal";
import DeviceDeleteRequestSubmittedModal from "./DeviceDeleteRequestSubmittedModal";
import {
  DEVICE_CATALOG_DEPARTMENTS,
  DEVICE_CATALOG_PAGE_SIZE,
  DEVICE_CATALOG_ROWS,
  DEVICE_CATALOG_SORT_OPTIONS,
  DEVICE_CATALOG_STATS,
  filterDeviceCatalogRows,
  getDeviceCatalogTotalEntries,
  type DeviceCatalogDepartmentFilter,
  type DeviceCatalogRow,
  type DeviceCatalogSortFilter,
} from "../../data/demoDeviceCatalog";
import "../../styles/device-management-screen.css";
import "../../styles/filter-picker-modal.css";
import "../../styles/device-delete-request-modal.css";
import "../../styles/device-delete-request-submitted-modal.css";

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

  return [1, "ellipsis", current, current + 1, "ellipsis", total];
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

type Props = {
  rows?: DeviceCatalogRow[];
  stats?: { total: number; active: number; inactive: number };
  departmentOptions?: Array<{ value: string; label: string }>;
  onRevokeRequest?: (row: DeviceCatalogRow) => void | Promise<void>;
  onDeactivateDevice?: (row: DeviceCatalogRow) => void | Promise<void>;
};

export default function DeviceManagementScreenBody({
  rows: rowsProp,
  stats: statsProp,
  departmentOptions,
  onRevokeRequest,
  onDeactivateDevice,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<DeviceCatalogDepartmentFilter>("all");
  const [sortFilter, setSortFilter] = useState<DeviceCatalogSortFilter>("default");
  const [page, setPage] = useState(1);
  const [departmentPickerOpen, setDepartmentPickerOpen] = useState(false);
  const [sortPickerOpen, setSortPickerOpen] = useState(false);
  const [revokeRequestOpen, setRevokeRequestOpen] = useState(false);
  const [revokeSubmittedOpen, setRevokeSubmittedOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<DeviceCatalogRow | null>(null);

  const openRevokeRequest = (row: DeviceCatalogRow) => {
    setRevokeTarget(row);
    setRevokeRequestOpen(true);
  };

  const closeRevokeRequest = () => {
    setRevokeRequestOpen(false);
  };

  const submitRevokeRequest = async () => {
    if (revokeTarget && onRevokeRequest) {
      await onRevokeRequest(revokeTarget);
    }
    setRevokeRequestOpen(false);
    setRevokeSubmittedOpen(true);
  };

  const closeRevokeSubmitted = () => {
    setRevokeSubmittedOpen(false);
  };

  const rowsSource = rowsProp ?? DEVICE_CATALOG_ROWS;
  const deviceStats = statsProp ?? DEVICE_CATALOG_STATS;
  const departments = departmentOptions ?? DEVICE_CATALOG_DEPARTMENTS;
  const departmentLabel =
    departments.find((option) => option.value === departmentFilter)?.label ?? "All Departments";

  const sortLabel =
    DEVICE_CATALOG_SORT_OPTIONS.find((option) => option.value === sortFilter)?.label ?? "Sort By";

  const isRegisteredActive = (row: DeviceCatalogRow) => row.registrationStatus === "active";

  useEffect(() => {
    setPage(1);
  }, [searchQuery, departmentFilter, sortFilter]);

  const filteredRows = useMemo(
    () => filterDeviceCatalogRows(rowsSource, searchQuery, departmentFilter, sortFilter),
    [rowsSource, searchQuery, departmentFilter, sortFilter],
  );

  const displayTotal = getDeviceCatalogTotalEntries(filteredRows.length);
  const totalPages = Math.max(1, Math.ceil(displayTotal / DEVICE_CATALOG_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * DEVICE_CATALOG_PAGE_SIZE;

  const pageRows: DeviceCatalogRow[] = useMemo(
    () => filteredRows.slice(pageStart, pageStart + DEVICE_CATALOG_PAGE_SIZE),
    [filteredRows, pageStart],
  );

  const showingFrom = displayTotal === 0 ? 0 : pageStart + 1;
  const showingTo = Math.min(pageStart + pageRows.length, displayTotal);
  const pageNumbers = paginationItems(currentPage, totalPages);

  const goToPage = (nextPage: number) => {
    setPage(Math.min(totalPages, Math.max(1, nextPage)));
  };

  return (
    <div className="admin-shell__content device-catalog">
      <div className="device-catalog__stats">
        <div className="device-catalog__stat">
          <div className="device-catalog__stat-icon device-catalog__stat-icon--total" aria-hidden="true">
            <img src={totalDevicesIcon} alt="" />
          </div>
          <div>
            <div className="device-catalog__stat-label">Total Devices</div>
            <div className="device-catalog__stat-value">{deviceStats.total.toLocaleString()}</div>
          </div>
        </div>

        <div className="device-catalog__stat">
          <div className="device-catalog__stat-icon device-catalog__stat-icon--active" aria-hidden="true">
            <img src={activeDevicesIcon} alt="" />
          </div>
          <div>
            <div className="device-catalog__stat-label">Online Devices</div>
            <div className="device-catalog__stat-value">{deviceStats.active.toLocaleString()}</div>
          </div>
        </div>

        <div className="device-catalog__stat">
          <div className="device-catalog__stat-icon device-catalog__stat-icon--inactive" aria-hidden="true">
            <img src={inactiveDevicesIcon} alt="" />
          </div>
          <div>
            <div className="device-catalog__stat-label">Offline Devices</div>
            <div className="device-catalog__stat-value">{deviceStats.inactive.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="device-catalog__card">
        <div className="device-catalog__toolbar">
          <label className="device-catalog__search">
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search..."
              aria-label="Search devices"
            />
          </label>

          <div className="device-catalog__filters">
            <div className="device-catalog__filter">
              <FilterPickerDropdown
                title="Select Department"
                options={departments.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                value={departmentFilter}
                triggerLabel={departmentLabel}
                ariaLabel="Department"
                open={departmentPickerOpen}
                onOpenChange={(open) => {
                  setDepartmentPickerOpen(open);
                  if (open) setSortPickerOpen(false);
                }}
                onApply={(value) => setDepartmentFilter(value as DeviceCatalogDepartmentFilter)}
              />
            </div>

            <div className="device-catalog__filter">
              <FilterPickerDropdown
                title="Sort By"
                options={DEVICE_CATALOG_SORT_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                value={sortFilter}
                triggerLabel={sortLabel}
                ariaLabel="Sort By"
                open={sortPickerOpen}
                onOpenChange={(open) => {
                  setSortPickerOpen(open);
                  if (open) setDepartmentPickerOpen(false);
                }}
                onApply={setSortFilter}
              />
            </div>
          </div>
        </div>

        <div className="device-catalog__table-wrap">
          <table className="device-catalog__table">
            <thead>
              <tr>
                <th>Device Name</th>
                <th>Serial Key</th>
                <th>Registered User</th>
                <th>Department</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="device-catalog__empty">
                    No devices match your filters
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => (
                  <tr
                    key={row.id}
                    className={row.isChildRow ? "device-catalog__row--child" : undefined}
                  >
                    <td className="device-catalog__device-name">
                      {row.isChildRow ? (
                        <span className="device-catalog__child-prefix" aria-hidden="true">
                          └
                        </span>
                      ) : null}
                      {row.deviceName}
                    </td>
                    <td className="device-catalog__serial-key">{row.serialKey}</td>
                    <td>{row.registeredUser}</td>
                    <td>{row.department}</td>
                    <td>
                      {row.warningNote ? (
                        <span className="device-catalog__warning-note">{row.warningNote}</span>
                      ) : (
                        <span
                          className={`device-catalog__status device-catalog__status--${row.status}`}
                        >
                          {row.status === "active" ? "Online" : "Offline"}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="device-catalog__actions">
                        {isRegisteredActive(row) && onDeactivateDevice ? (
                          <button
                            type="button"
                            className="device-catalog__deactivate-btn"
                            onClick={() => void onDeactivateDevice(row)}
                          >
                            Allow new device
                          </button>
                        ) : null}
                        {!isRegisteredActive(row) && onRevokeRequest ? (
                          <button
                            type="button"
                            className="device-catalog__delete-btn"
                            onClick={() => openRevokeRequest(row)}
                          >
                            Request to Revoke
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="device-catalog__footer">
          <span className="device-catalog__summary">
            Showing {showingFrom} to {showingTo} of {displayTotal} entries
          </span>

          <div className="device-catalog__pagination">
            <button
              type="button"
              className="device-catalog__page-btn"
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
              aria-label="Previous page"
            >
              <IconChevronLeft />
            </button>

            {pageNumbers.map((pageNumber, index) =>
              pageNumber === "ellipsis" ? (
                <span key={`ellipsis-${index}`} className="device-catalog__page-ellipsis">
                  ...
                </span>
              ) : (
                <button
                  key={pageNumber}
                  type="button"
                  className={`device-catalog__page-btn${
                    pageNumber === currentPage ? " device-catalog__page-btn--active" : ""
                  }`}
                  onClick={() => goToPage(pageNumber)}
                  aria-current={pageNumber === currentPage ? "page" : undefined}
                >
                  {pageNumber}
                </button>
              )
            )}

            <button
              type="button"
              className="device-catalog__page-btn"
              disabled={currentPage >= totalPages}
              onClick={() => goToPage(currentPage + 1)}
              aria-label="Next page"
            >
              <IconChevronRight />
            </button>
          </div>
        </div>
      </div>

      <PortalOverlay open={revokeRequestOpen} onClose={closeRevokeRequest}>
        <DeviceDeleteRequestModal onCancel={closeRevokeRequest} onSubmit={submitRevokeRequest} />
      </PortalOverlay>

      <PortalOverlay open={revokeSubmittedOpen} onClose={closeRevokeSubmitted}>
        <DeviceDeleteRequestSubmittedModal onDone={closeRevokeSubmitted} />
      </PortalOverlay>
    </div>
  );
}
