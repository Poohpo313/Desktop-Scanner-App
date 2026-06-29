import { Download, Info, Layers2, Printer, Scan, Settings, Upload, X } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import type { ManagedDevice } from "./devicesData";
import { deviceKindLabel, isScanCapableDevice } from "./devicesData";
import "../../styles/install-driver-modal.css";

export type InstallMethod = "automatic" | "manual";

type InstallDriverModalProps = {
  device: ManagedDevice;
  onCancel: () => void;
  onInstall: (method: InstallMethod) => void;
};

function deviceInstallSummary(device: ManagedDevice): string {
  return `${deviceKindLabel(device.kind)} • ${device.connection}`;
}

function DeviceIcon({ device }: { device: ManagedDevice }) {
  if (device.kind === "scanner") {
    return <Scan className="install-driver-modal__device-icon" strokeWidth={1.8} />;
  }
  if (device.kind === "multifunction") {
    return <Layers2 className="install-driver-modal__device-icon" strokeWidth={1.8} />;
  }
  return <Printer className="install-driver-modal__device-icon" strokeWidth={1.8} />;
}

export function InstallDriverModal({ device, onCancel, onInstall }: InstallDriverModalProps) {
  const [method, setMethod] = useState<InstallMethod>("automatic");

  return createPortal(
    <div className="install-driver-modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="install-driver-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-driver-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="install-driver-modal__header">
          <h2 id="install-driver-modal-title" className="install-driver-modal__title">
            Install Device Driver
          </h2>
          <button
            type="button"
            className="install-driver-modal__close"
            onClick={onCancel}
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </header>

        <div className="install-driver-modal__body">
          <section className="install-driver-modal__section">
            <h3 className="install-driver-modal__section-title">Selected Device</h3>
            <div className="install-driver-modal__card">
              <span className="install-driver-modal__device-icon-wrap">
                <DeviceIcon device={device} />
              </span>
              <div>
                <p className="install-driver-modal__device-name">{device.name}</p>
                <p className="install-driver-modal__device-meta">{deviceInstallSummary(device)}</p>
              </div>
            </div>
          </section>

          <section className="install-driver-modal__section">
            <h3 className="install-driver-modal__section-title">Driver Status</h3>
            <div className="install-driver-modal__alert" role="status">
              <Info className="install-driver-modal__alert-icon" strokeWidth={1.8} />
              <div>
                <p className="install-driver-modal__alert-title">
                  No compatible driver is currently installed.
                </p>
                <p className="install-driver-modal__alert-text">
                  A driver is required to enable full functionality.
                </p>
              </div>
            </div>
          </section>

          <section className="install-driver-modal__section">
            <h3 className="install-driver-modal__section-title">Recommended Driver</h3>
            <div className="install-driver-modal__card install-driver-modal__card--driver">
              <span className="install-driver-modal__driver-icon-wrap">
                <Settings className="install-driver-modal__driver-icon" strokeWidth={1.8} />
              </span>
              <div className="install-driver-modal__driver-body">
                <p className="install-driver-modal__driver-name">{device.driver}</p>
                <p className="install-driver-modal__driver-meta">Latest stable driver</p>
              </div>
              <span className="install-driver-modal__recommended-badge">Recommended</span>
            </div>
          </section>

          <section className="install-driver-modal__section">
            <h3 className="install-driver-modal__section-title">Installation Method</h3>
            <div className="install-driver-modal__methods">
              <button
                type="button"
                className={`install-driver-modal__method${
                  method === "automatic" ? " install-driver-modal__method--active" : ""
                }`}
                onClick={() => setMethod("automatic")}
              >
                <span className="install-driver-modal__method-radio" aria-hidden="true" />
                <Download className="install-driver-modal__method-icon" strokeWidth={1.8} />
                <span className="install-driver-modal__method-title">Automatic Install</span>
                <span className="install-driver-modal__method-desc">
                  Download and install the driver automatically.
                </span>
              </button>
              <button
                type="button"
                className={`install-driver-modal__method${
                  method === "manual" ? " install-driver-modal__method--active" : ""
                }`}
                onClick={() => setMethod("manual")}
              >
                <span className="install-driver-modal__method-radio" aria-hidden="true" />
                <Upload className="install-driver-modal__method-icon" strokeWidth={1.8} />
                <span className="install-driver-modal__method-title">Manual Upload</span>
                <span className="install-driver-modal__method-desc">
                  Upload a driver file (.exe or .msi) from your computer.
                </span>
              </button>
            </div>
          </section>
        </div>

        <footer className="install-driver-modal__footer">
          <button type="button" className="install-driver-modal__btn install-driver-modal__btn--cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="install-driver-modal__btn install-driver-modal__btn--install"
            onClick={() => onInstall(method)}
          >
            <Download className="h-4 w-4" strokeWidth={2} />
            Install Driver
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
