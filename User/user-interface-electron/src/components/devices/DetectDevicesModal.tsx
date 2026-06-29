import { ChevronRight, Network, Printer, Scan, Usb, Wifi, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AppErrorState } from "../common/AppErrorState";
import {
  apiDeviceToDetected,
  detectedDeviceSummary,
  type DetectedDevice,
} from "./detectedDevicesData";
import { scanDeviceToManagedDevice, type ManagedDevice } from "./devicesData";
import { deviceNamesMatch } from "../../lib/deviceNameMatch";
import "../../styles/detect-devices-modal.css";

type DetectDevicesModalProps = {
  onCancel: () => void;
  onAddSelected: (devices: ManagedDevice[]) => void;
};

function dedupeDetected(devices: DetectedDevice[]): DetectedDevice[] {
  const result: DetectedDevice[] = [];

  for (const device of devices) {
    if (result.some((entry) => deviceNamesMatch(entry.name, device.name))) continue;
    result.push(device);
  }

  return result;
}

function DetectedDeviceIcon({ device }: { device: DetectedDevice }) {
  if (device.kind === "scanner" || device.kind === "multifunction") {
    return <Scan className="detect-devices-modal__device-icon" strokeWidth={1.8} />;
  }
  return <Printer className="detect-devices-modal__device-icon" strokeWidth={1.8} />;
}

export function DetectDevicesModal({ onCancel, onAddSelected }: DetectDevicesModalProps) {
  const [isSearching, setIsSearching] = useState(true);
  const [detected, setDetected] = useState<DetectedDevice[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    async function search() {
      setIsSearching(true);
      setSearchError(null);

      try {
        const response = (await window.bukolabs?.scanner?.listDevices()) as {
          devices?: Array<{
            id: string;
            name: string;
            type: string;
            driver: string;
            connection?: string;
          }>;
        };

        if (cancelled) return;

        const rows = dedupeDetected(
          (response?.devices ?? [])
            .map(apiDeviceToDetected)
            .filter((device) => device.status === "connected"),
        );

        setDetected(rows);
        setSelectedIds(new Set(rows.map((device) => device.id)));

        if (rows.length === 0) {
          setSearchError("No connected scanners or printers were detected.");
        }
      } catch {
        if (!cancelled) {
          setSearchError("Device search failed. Check connections and try again.");
          setDetected([]);
          setSelectedIds(new Set());
        }
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }

    void search();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedCount = selectedIds.size;

  function toggleDevice(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAddSelected() {
    if (selectedCount === 0) return;

    const additions = detected
      .filter((device) => selectedIds.has(device.id))
      .map((device) =>
        scanDeviceToManagedDevice({
          id: device.id,
          name: device.name,
          type: device.kind === "multifunction" ? "multifunction" : device.kind,
          driver: device.driver,
          connection: device.connectionType,
        }),
      );

    onAddSelected(additions);
  }

  return createPortal(
    <div className="detect-devices-modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="detect-devices-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detect-devices-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="detect-devices-modal__header">
          <h2 id="detect-devices-modal-title" className="detect-devices-modal__title">
            Detect Devices
          </h2>
          <button
            type="button"
            className="detect-devices-modal__close"
            onClick={onCancel}
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </header>

        <div className="detect-devices-modal__body">
          <div className="detect-devices-modal__search">
            <div
              className={`detect-devices-modal__search-icon${isSearching ? " detect-devices-modal__search-icon--active" : ""}`}
              aria-hidden="true"
            >
              <span className="detect-devices-modal__search-bar" />
            </div>
            <p className="detect-devices-modal__search-text">
              {isSearching
                ? "Searching for connected scanners and printers..."
                : searchError ?? "Search complete. Select devices to add."}
            </p>
            <div className="detect-devices-modal__channels">
              <span>
                <Usb className="detect-devices-modal__channel-icon" strokeWidth={1.8} />
                USB
              </span>
              <span>
                <Network className="detect-devices-modal__channel-icon" strokeWidth={1.8} />
                Network
              </span>
              <span>
                <Wifi className="detect-devices-modal__channel-icon" strokeWidth={1.8} />
                Wi-Fi
              </span>
            </div>
          </div>

          {!isSearching && detected.length > 0 ? (
            <section className="detect-devices-modal__results">
              <h3 className="detect-devices-modal__results-title">
                Detected Devices ({detected.length})
              </h3>
              <div className="detect-devices-modal__list">
                {detected.map((device) => {
                  const checked = selectedIds.has(device.id);
                  return (
                    <label
                      key={device.id}
                      className={`detect-devices-modal__item${checked ? " detect-devices-modal__item--selected" : ""}`}
                    >
                      <input
                        type="checkbox"
                        className="detect-devices-modal__checkbox"
                        checked={checked}
                        onChange={() => toggleDevice(device.id)}
                      />
                      <span className="detect-devices-modal__item-icon-wrap">
                        <DetectedDeviceIcon device={device} />
                      </span>
                      <span className="detect-devices-modal__item-body">
                        <span className="detect-devices-modal__item-name">{device.name}</span>
                        <span className="detect-devices-modal__item-meta">
                          {detectedDeviceSummary(device)}
                        </span>
                      </span>
                      <span className="detect-devices-modal__item-badge">Connected</span>
                      <ChevronRight className="detect-devices-modal__item-chevron" strokeWidth={2} />
                    </label>
                  );
                })}
              </div>
            </section>
          ) : null}

          {!isSearching && searchError ? (
            <AppErrorState
              variant={detected.length === 0 ? "empty" : "warning"}
              title={detected.length === 0 ? "No Devices Detected" : "Search Notice"}
              message={searchError}
              compact
            />
          ) : null}
        </div>

        <footer className="detect-devices-modal__footer">
          <button type="button" className="detect-devices-modal__btn detect-devices-modal__btn--cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="detect-devices-modal__btn detect-devices-modal__btn--add"
            disabled={isSearching || selectedCount === 0}
            onClick={handleAddSelected}
          >
            Add Selected Device
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
