import { useCallback, useEffect, useMemo, useState } from "react";
import FigmaModal from "./FigmaModal";
import { IconSearch } from "../icons/AdminIcons";
import { useNotificationStore } from "../../store/notificationStore";
import {
  VIEW_DEVICES_FLEET,
  VIEW_DEVICES_TOTAL,
  exportViewDevicesCsv,
  filterViewDevices,
  scanDeviceFleet,
  type ViewDeviceRow,
  type ViewDeviceType,
} from "../../data/viewDevicesFleet";
import closeIcon from "../../icons/Modal Header/Icon-209.svg";
import scanIcon from "../../icons/view-devices-scan-icon.svg";
import "../../styles/view-devices-modal.css";

type Props = {
  closeTo?: string;
  onClose?: () => void;
  onScanComplete?: () => void;
  devices?: ViewDeviceRow[];
  totalCount?: number;
};
function DeviceTypeIcon({ type }: { type: ViewDeviceType }) {
  if (type === "server") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="2.5" y="2.5" width="11" height="3.25" rx="0.75" stroke="#007A5E" strokeWidth="1.2" />
        <rect x="2.5" y="6.375" width="11" height="3.25" rx="0.75" stroke="#007A5E" strokeWidth="1.2" />
        <rect x="2.5" y="10.25" width="11" height="3.25" rx="0.75" stroke="#007A5E" strokeWidth="1.2" />
        <circle cx="4.5" cy="4.125" r="0.65" fill="#007A5E" />
        <circle cx="4.5" cy="8" r="0.65" fill="#007A5E" />
        <circle cx="4.5" cy="11.875" r="0.65" fill="#007A5E" />
      </svg>
    );
  }

  if (type === "mobile") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="5" y="1.75" width="6" height="12.5" rx="1.25" stroke="#007A5E" strokeWidth="1.2" />
        <path d="M7 12.75H9" stroke="#007A5E" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "router") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="2.75" y="5.5" width="10.5" height="6.75" rx="1" stroke="#007A5E" strokeWidth="1.2" />
        <path d="M5.5 5.5V4.25C5.5 3.01 6.51 2 7.75 2H8.25C9.49 2 10.5 3.01 10.5 4.25V5.5" stroke="#007A5E" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="5.75" cy="8.875" r="0.65" fill="#007A5E" />
        <circle cx="8" cy="8.875" r="0.65" fill="#007A5E" />
        <circle cx="10.25" cy="8.875" r="0.65" fill="#007A5E" />
      </svg>
    );
  }

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2.25" y="3.5" width="11.5" height="7.75" rx="1" stroke="#007A5E" strokeWidth="1.2" />
      <path d="M2.25 6.25H13.75" stroke="#007A5E" strokeWidth="1.2" />
      <path d="M8 11.25V13.25" stroke="#007A5E" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M5.75 13.25H10.25" stroke="#007A5E" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconFilter({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M1.75 2.625H12.25L8.3125 7.875V11.375L5.6875 12.625V7.875L1.75 2.625Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function IconScan({ className }: { className?: string }) {
  return <img src={scanIcon} alt="" aria-hidden="true" className={className} draggable={false} />;
}

export default function ViewDevicesModal({
  closeTo = "/admin-dashboard-2226-1193",
  onClose,
  onScanComplete,
  devices = VIEW_DEVICES_FLEET,
  totalCount = VIEW_DEVICES_TOTAL,
}: Props) {
  const push = useNotificationStore((s) => s.push);
  const [query, setQuery] = useState("");
  const [fleet, setFleet] = useState(devices);
  const [fleetTotal, setFleetTotal] = useState(totalCount);
  const [scanning, setScanning] = useState(false);

  const loadFleet = useCallback(async () => {
    const result = await scanDeviceFleet(fleet, fleetTotal);
    setFleet(result.devices);
    setFleetTotal(result.totalCount);
    return result;
  }, [fleet, fleetTotal]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const result = await scanDeviceFleet([], 0);
      if (cancelled) return;
      setFleet(result.devices);
      setFleetTotal(result.totalCount);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredDevices = useMemo(() => filterViewDevices(fleet, query), [fleet, query]);

  const handleScan = async () => {
    if (scanning) return;

    setScanning(true);
    push("Scanning for new devices…", "info");

    try {
      const result = await scanDeviceFleet(fleet, fleetTotal);
      setFleet(result.devices);
      setFleetTotal(result.totalCount);
      setQuery("");
      onScanComplete?.();

      if (result.added > 0) {
        push(
          `Scan complete: ${result.added} new device${result.added === 1 ? "" : "s"} found`,
          "success"
        );
      } else {
        push("Device fleet refreshed", "success");
      }
    } catch {
      push("Device scan failed", "error");
    } finally {
      setScanning(false);
    }
  };

  const footer = (
    <div className="view-devices__footer">
      <p className="view-devices__count">
        Showing {filteredDevices.length} of {fleetTotal} total devices
      </p>
      <div className="view-devices__footer-actions">
        <button
          type="button"
          className="figma-btn figma-btn--secondary view-devices__export-btn"
          onClick={() => exportViewDevicesCsv(filteredDevices)}
          disabled={scanning}
        >
          Export CSV
        </button>
        <button
          type="button"
          className={`figma-btn figma-btn--primary view-devices__scan-btn${scanning ? " view-devices__scan-btn--scanning" : ""}`}
          onClick={() => void handleScan()}
          disabled={scanning}
        >
          <IconScan className="view-devices__scan-icon" />
          {scanning ? "Scanning..." : "Scan for New Devices"}
        </button>
      </div>
    </div>
  );
  return (
    <FigmaModal
      className="figma-modal--view-devices"
      title="View Devices"
      subtitle={`${fleetTotal} devices currently tracked in your enterprise fleet`}
      wide
      onClose={onClose ? undefined : closeTo}
      onDismiss={onClose}
      closeIcon={<img src={closeIcon} alt="" aria-hidden="true" />}
      footer={footer}
      footerClassName="view-devices__footer-wrap"
    >
      <div className="view-devices__toolbar">
        <label className="view-devices__search">
          <IconSearch className="view-devices__search-icon" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by name, IP, or OS..."
            aria-label="Filter devices"
          />
        </label>
        <button type="button" className="view-devices__filter-btn">
          <IconFilter className="view-devices__filter-icon" />
          Filter
        </button>
      </div>

      <div className="view-devices__table-wrap">
        <table className="view-devices__table">
          <thead>
            <tr>
              <th scope="col">Device Name</th>
              <th scope="col">Operating System</th>
              <th scope="col">IP Address</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.map((device) => (
              <tr key={device.id}>
                <td>
                  <div className="view-devices__device-cell">
                    <span className="view-devices__device-icon" aria-hidden="true">
                      <DeviceTypeIcon type={device.type} />
                    </span>
                    <span className="view-devices__device-meta">
                      <span className="view-devices__device-name">{device.name}</span>
                      <span className="view-devices__device-asset">Asset ID: {device.assetId}</span>
                    </span>
                  </div>
                </td>
                <td className="view-devices__os">{device.os}</td>
                <td className="view-devices__ip">{device.ipAddress}</td>
                <td>
                  <span className={`view-devices__status view-devices__status--${device.status}`}>
                    {device.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FigmaModal>
  );
}
