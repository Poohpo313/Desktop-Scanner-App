import { Layers2, Plus, Printer, Scan } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppErrorState } from "../common/AppErrorState";
import { AppStatusBar } from "../layout/AppStatusBar";
import { ConsolePageHeader } from "../layout/ConsolePageHeader";
import { getConsolePageSubtitle, getConsolePageTitle } from "../layout/consolePageMeta";
import { useDevices } from "../../context/DevicesContext";
import {
  buildManagedDeviceFromForm,
  deviceStatusLabel,
  deviceTestActionLabel,
  isScanCapableDevice,
  type AddDevicePayload,
  type ManagedDevice,
} from "./devicesData";
import { AddDeviceModal } from "./AddDeviceModal";
import { DetectDevicesModal } from "./DetectDevicesModal";
import { RunDiagnosticsModal } from "./RunDiagnosticsModal";
import "../../styles/devices-page.css";

function DeviceKindIcon({ device, className }: { device: ManagedDevice; className?: string }) {
  if (device.kind === "scanner") {
    return <Scan className={className} strokeWidth={1.8} />;
  }
  if (device.kind === "multifunction") {
    return <Layers2 className={className} strokeWidth={1.8} />;
  }
  return <Printer className={className} strokeWidth={1.8} />;
}

function StatusBadge({ status }: { status: ManagedDevice["status"] }) {
  return (
    <span className={`devices-status-badge devices-status-badge--${status}`}>
      {deviceStatusLabel(status)}
    </span>
  );
}

export function DevicesPageView() {
  const navigate = useNavigate();
  const { devices, addDevice, addDevices, updateDevice } = useDevices();
  const [selectedId, setSelectedId] = useState(devices[0]?.id ?? "");
  const [diagnosticsMessage, setDiagnosticsMessage] = useState<string | null>(null);
  const [showDetectModal, setShowDetectModal] = useState(false);
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);

  const selectedDevice = devices.find((device) => device.id === selectedId) ?? devices[0] ?? null;

  function openDiagnosticsModal() {
    if (!selectedDevice || !isScanCapableDevice(selectedDevice)) return;
    setShowDiagnosticsModal(true);
  }

  function handleDiagnosticsComplete(message: string, healthy: boolean) {
    setDiagnosticsMessage(message);
    updateDevice(selectedId, { diagnosticsStatus: message, diagnosticsHealthy: healthy });
    setShowDiagnosticsModal(false);
  }

  function handleTestAction(device: ManagedDevice) {
    if (device.status === "offline") return;

    if (device.kind === "scanner" || device.kind === "multifunction") {
      navigate("/scan", {
        state: {
          scannerId: device.id,
          step: "select",
        },
      });
      return;
    }

    if (device.kind === "printer") {
      navigate("/print");
    }
  }

  function handleAddDetectedDevices(nextDevices: ManagedDevice[]) {
    const additions = nextDevices.filter(
      (device) => !devices.some((existing) => existing.id === device.id),
    );

    if (additions.length > 0) {
      addDevices(additions);
      setSelectedId(additions[0].id);
    }

    setShowDetectModal(false);
  }

  function handleAddDevice(payload: AddDevicePayload) {
    const device = buildManagedDeviceFromForm(payload);
    addDevice(device);
    setSelectedId(device.id);
    setDiagnosticsMessage(null);
    setShowAddDeviceModal(false);
  }

  return (
    <div className="devices-page console-page" data-screen="section-06-devices">
      <ConsolePageHeader
        title={getConsolePageTitle("Devices")}
        subtitle={getConsolePageSubtitle("Devices")}
        badges={
          <div className="devices-page__header-actions">
            <button type="button" className="devices-btn devices-btn--outline" onClick={() => setShowDetectModal(true)}>
              Detect Devices
            </button>
            <button type="button" className="devices-btn devices-btn--primary" onClick={() => setShowAddDeviceModal(true)}>
              <Plus className="h-4 w-4" strokeWidth={2} />
              Add Device
            </button>
          </div>
        }
      />

      <div className="devices-page__content console-page__body">

        <div className="devices-page__layout">
          <section className="devices-page__list-pane">
            <h2 className="devices-page__pane-title">Scanners &amp; Printers</h2>
            <div className="devices-page__list">
              {devices.length === 0 ? (
                <AppErrorState
                  variant="empty"
                  title="No Devices Added"
                  message="No scanners or printers are set up yet. Detect connected hardware or add a device manually to get started."
                  actionLabel="Detect Devices"
                  onAction={() => setShowDetectModal(true)}
                />
              ) : (
                devices.map((device) => (
                  <DeviceCard
                    key={device.id}
                    device={device}
                    active={selectedDevice?.id === device.id}
                    onSelect={() => {
                      setSelectedId(device.id);
                      setDiagnosticsMessage(null);
                    }}
                    onTestAction={() => handleTestAction(device)}
                  />
                ))
              )}
            </div>
          </section>

          <aside className="devices-page__details-pane">
            <h2 className="devices-page__pane-title">Device Details</h2>
            {selectedDevice ? (
              <DeviceDetails
                device={selectedDevice}
                diagnosticsMessage={diagnosticsMessage}
                onRunDiagnostics={openDiagnosticsModal}
              />
            ) : (
              <AppErrorState
                variant="empty"
                title="Select a Device"
                message="Choose a scanner or printer from the list to view its details and run diagnostics."
                compact
              />
            )}
          </aside>
        </div>
      </div>

      <AppStatusBar variant="devices-status-bar" />

      {showDetectModal ? (
        <DetectDevicesModal
          onCancel={() => setShowDetectModal(false)}
          onAddSelected={handleAddDetectedDevices}
        />
      ) : null}

      {showAddDeviceModal ? (
        <AddDeviceModal onCancel={() => setShowAddDeviceModal(false)} onAdd={handleAddDevice} />
      ) : null}

      {showDiagnosticsModal && selectedDevice ? (
        <RunDiagnosticsModal
          device={selectedDevice}
          onCancel={() => setShowDiagnosticsModal(false)}
          onComplete={handleDiagnosticsComplete}
        />
      ) : null}
    </div>
  );
}

function DeviceCard({
  device,
  active,
  onSelect,
  onTestAction,
}: {
  device: ManagedDevice;
  active: boolean;
  onSelect: () => void;
  onTestAction: () => void;
}) {
  return (
    <article className={`devices-card${active ? " devices-card--active" : ""}`}>
      <button type="button" className="devices-card__main" onClick={onSelect}>
        <div className={`devices-card__icon-wrap devices-card__icon-wrap--${device.kind}`}>
          <DeviceKindIcon device={device} className="devices-card__icon" />
        </div>
        <div className="devices-card__body">
          <h3 className="devices-card__name">{device.name}</h3>
          <p className="devices-card__meta">{device.connectionLabel}</p>
        </div>
        <StatusBadge status={device.status} />
      </button>
      <button
        type="button"
        className="devices-card__action"
        disabled={device.status === "offline"}
        onClick={(event) => {
          event.stopPropagation();
          onTestAction();
        }}
      >
        {deviceTestActionLabel(device)}
      </button>
    </article>
  );
}

function DeviceDetails({
  device,
  diagnosticsMessage,
  onRunDiagnostics,
}: {
  device: ManagedDevice;
  diagnosticsMessage: string | null;
  onRunDiagnostics: () => void;
}) {
  const diagnosticsText = diagnosticsMessage ?? device.diagnosticsStatus;

  return (
    <>
      <div className="devices-details__hero">
        <div className={`devices-details__icon-wrap devices-details__icon-wrap--${device.kind}`}>
          <DeviceKindIcon device={device} className="devices-details__icon" />
        </div>
        <div className="devices-details__hero-body">
          <h3 className="devices-details__name">{device.name}</h3>
          <p className="devices-details__meta">{device.connectionLabel}</p>
        </div>
        <StatusBadge status={device.status} />
      </div>

      <dl className="devices-details__meta-list">
        <div>
          <dt>Connection</dt>
          <dd>{device.connection}</dd>
        </div>
        <div>
          <dt>Serial Number</dt>
          <dd>{device.serialNumber}</dd>
        </div>
        <div>
          <dt>Driver</dt>
          <dd>{device.driver}</dd>
        </div>
        {isScanCapableDevice(device) ? (
          <>
            <div>
              <dt>Resolution</dt>
              <dd>{device.resolution}</dd>
            </div>
            <div>
              <dt>Max Scan Size</dt>
              <dd>{device.maxScanSize}</dd>
            </div>
          </>
        ) : null}
        {device.kind === "printer" || device.kind === "multifunction" ? (
          <div>
            <dt>Paper Size</dt>
            <dd>{device.paperSize}</dd>
          </div>
        ) : null}
      </dl>

      <section className="devices-details__diagnostics">
        <h3 className="devices-details__diagnostics-title">Scanner Diagnostics</h3>
        <p
          className={`devices-details__diagnostics-status${
            device.diagnosticsHealthy ? " devices-details__diagnostics-status--ok" : ""
          }`}
        >
          {diagnosticsText}
        </p>
        <button
          type="button"
          className="devices-btn devices-btn--primary devices-btn--block"
          onClick={onRunDiagnostics}
          disabled={!isScanCapableDevice(device)}
        >
          Run Diagnostics
        </button>
      </section>
    </>
  );
}
