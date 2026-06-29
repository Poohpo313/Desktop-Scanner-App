import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { devicesApi } from "../../api/devices.api";
import { useNotificationStore } from "../../store/notificationStore";
import { PORTAL } from "../../routes/portalPaths";
import type { AdminUser } from "../../types";
import "../../styles/provision-device.css";

type Props = {
  variant?: "figma" | "portal";
  presentation?: "page" | "overlay";
  devicesRoute?: string;
  users?: AdminUser[];
  onRegister?: () => void;
  onSaveDraft?: () => void;
  onCancel?: () => void;
};

const SCANNER_IMAGE = "";

function IconDevice() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="10" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5.5 11H10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M6 6.5H10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconAssignment() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 2.5L12.5 4.25V7.75C12.5 10.45 10.55 12.75 8 13.5C5.45 12.75 3.5 10.45 3.5 7.75V4.25L8 2.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M6.25 8.25L7.5 9.5L9.9 7.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconConnection() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M5.5 2.75V5.25M10.5 2.75V5.25" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path
        d="M4.75 5.25H11.25L12.25 8.25V12.25H3.75V8.25L4.75 5.25Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M6.25 9.25H9.75" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconWifi() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2.5 8C4.5 5.75 6.25 4.5 8 4.5C9.75 4.5 11.5 5.75 13.5 8M5 10.75C6.1 9.5 7 9 8 9C9 9 9.9 9.5 11 10.75"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconRegister() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="6" cy="5" r="2.25" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2.5 13C3.2 10.5 4.5 9.25 6 9.25C7.5 9.25 8.8 10.5 9.5 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M11.5 8.5V13.5M9 11H14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconSave() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.5 3.5H10.5L12.5 5.5V12.5H3.5V3.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M5.5 3.5V6.5H9.5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M5.5 9.5H10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconTip() {
  return (
    <svg className="provision-device__tip-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 2.25C5.65 2.25 3.75 4.15 3.75 6.5C3.75 8.45 4.95 10.1 6.65 10.85L7.25 12.75H8.75L9.35 10.85C11.05 10.1 12.25 8.45 12.25 6.5C12.25 4.15 10.35 2.25 8 2.25Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M7.25 13.75H8.75" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function SectionHead({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="provision-device__section-head">
      <span className="provision-device__section-icon">{icon}</span>
      <h2 className="provision-device__section-title">{title}</h2>
    </div>
  );
}

export default function ProvisionDeviceBody({
  variant = "figma",
  presentation = "page",
  devicesRoute,
  users = [],
  onRegister,
  onSaveDraft,
  onCancel,
}: Props) {
  const push = useNotificationStore((s) => s.push);
  const isOverlay = presentation === "overlay";
  const cancelHref = devicesRoute ?? (variant === "portal" ? PORTAL.devices : "/device-management");
  const devicesBreadcrumbHref = devicesRoute ?? (variant === "portal" ? PORTAL.devices : "/device-management");

  const [deviceName, setDeviceName] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [deviceType, setDeviceType] = useState("scanner");
  const [serialNumber, setSerialNumber] = useState("");
  const [assignedUserId, setAssignedUserId] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (assignedUserId !== "" || users.length === 0) return;
    setAssignedUserId(users[0]?.userId ?? "");
  }, [assignedUserId, users]);

  const previewName = deviceName.trim();
  const previewModel = deviceModel.trim();

  const handleRegister = async () => {
    if (variant === "figma") {
      if (onRegister) {
        onRegister();
        return;
      }
      push("Device registered successfully", "success");
      return;
    }

    if (!deviceName.trim() || !serialNumber.trim() || assignedUserId === "") {
      push("Enter device name, serial number, and assigned user", "error");
      return;
    }

    setSubmitting(true);
    try {
      await devicesApi.register({
        deviceName: deviceName.trim(),
        deviceType,
        serialNumber: serialNumber.trim(),
        assignedUser: Number(assignedUserId),
      });
      push("Device registered successfully", "success");
      onRegister?.();
    } catch {
      push("Device registration failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft();
      return;
    }
    push("Provisioning draft saved", "success");
  };

  const content = (
    <>
      <header className="provision-device__header">
        <p className="provision-device__breadcrumb">
          <Link to={devicesBreadcrumbHref}>Devices</Link>
          <span> / Provision Device</span>
        </p>
        <h1 className="provision-device__title">Provision Device</h1>
      </header>

      <div className="provision-device__layout">
        <div className="provision-device__main">
          <section className="provision-device__section-card">
            <SectionHead icon={<IconDevice />} title="Device Information" />
            <div className="provision-device__grid">
              <label className="provision-device__field">
                <span className="provision-device__label">Device Name</span>
                <input
                  className="provision-device__input"
                  placeholder="Device name"
                  value={deviceName}
                  onChange={(event) => setDeviceName(event.target.value)}
                />
              </label>
              <label className="provision-device__field">
                <span className="provision-device__label">Device Type</span>
                <select
                  className="provision-device__select"
                  value={deviceType}
                  onChange={(event) => setDeviceType(event.target.value)}
                >
                  <option value="scanner">Scanner</option>
                  <option value="printer">Printer</option>
                  <option value="multifunction">Multifunction</option>
                </select>
              </label>
              <label className="provision-device__field">
                <span className="provision-device__label">Device Model</span>
                <input
                  className="provision-device__input"
                  placeholder="e.g. HP ScanJet Pro 3000"
                  value={deviceModel}
                  onChange={(event) => setDeviceModel(event.target.value)}
                />
              </label>
              <label className="provision-device__field">
                <span className="provision-device__label">Serial Number</span>
                <input
                  className="provision-device__input"
                  placeholder="e.g. SN-88231F-X"
                  value={serialNumber}
                  onChange={(event) => setSerialNumber(event.target.value)}
                />
              </label>
              <label className="provision-device__field provision-device__field--full">
                <span className="provision-device__label">MAC Address</span>
                <input className="provision-device__input" placeholder="00:00:00:00:00:00" />
              </label>
            </div>
          </section>

          <section className="provision-device__section-card">
            <SectionHead icon={<IconAssignment />} title="Assignment Information" />
            <div className="provision-device__grid">
              <label className="provision-device__field">
                <span className="provision-device__label">Assigned User</span>
                <select
                  className="provision-device__select"
                  value={assignedUserId}
                  onChange={(event) =>
                    setAssignedUserId(event.target.value ? Number(event.target.value) : "")
                  }
                >
                  <option value="" disabled>
                    Select User...
                  </option>
                  {users.map((user) => (
                    <option key={user.userId} value={user.userId}>
                      {[user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
                        user.username}
                    </option>
                  ))}
                </select>
              </label>
              <label className="provision-device__field">
                <span className="provision-device__label">Department</span>
                <select className="provision-device__select" defaultValue="" disabled>
                  <option value="">Assigned from user profile</option>
                </select>
              </label>
              <label className="provision-device__field provision-device__field--full">
                <span className="provision-device__label">Assigned Serial Key</span>
                <select className="provision-device__select" defaultValue="" disabled>
                  <option value="">Optional — link from user record</option>
                </select>
              </label>
            </div>
          </section>

          <section className="provision-device__section-card">
            <SectionHead icon={<IconConnection />} title="Connection Settings" />
            <div className="provision-device__connection">
              <div className="provision-device__connection-item">
                <span className="provision-device__connection-label">Device Status</span>
                <span className="provision-device__status-pill">
                  <span className="provision-device__status-dot" aria-hidden="true" />
                  Discoverable
                </span>
              </div>
              <div className="provision-device__connection-item">
                <span className="provision-device__connection-label">Network Status</span>
                <span className="provision-device__network">
                  <IconWifi />
                  Bukalabs_Secure_HS
                </span>
              </div>
              <div className="provision-device__connection-item">
                <span className="provision-device__connection-label">Last Sync</span>
                <span className="provision-device__sync">Jan 24, 2024 - 14:32:06</span>
              </div>
            </div>
          </section>
        </div>

        <aside className="provision-device__sidebar">
          <div className="provision-device__preview">
            <div className="provision-device__preview-top">
              <p className="provision-device__preview-label">Device Preview</p>
              <h3 className="provision-device__preview-name">{previewName}</h3>
              <p className="provision-device__preview-model">{previewModel}</p>
              <div className="provision-device__preview-row">
                <span>Validation Status</span>
                <span className="provision-device__validated">
                  <IconCheck />
                  Validated
                </span>
              </div>
              <div className="provision-device__preview-row">
                <span>Provisioning</span>
                <span>Ready</span>
              </div>
              <div className="provision-device__preview-row">
                <span>Connection</span>
                <span>Encrypted</span>
              </div>
            </div>
            <div className="provision-device__preview-image-wrap">
              <img className="provision-device__preview-image" src={SCANNER_IMAGE} alt="" />
            </div>
          </div>

          <div className="provision-device__actions">
            <button
              type="button"
              className="provision-device__btn provision-device__btn--primary"
              onClick={() => void handleRegister()}
              disabled={submitting}
            >
              <IconRegister />
              Register Device
            </button>
            <button type="button" className="provision-device__btn provision-device__btn--secondary" onClick={handleSaveDraft}>
              <IconSave />
              Save Draft
            </button>
            {isOverlay && onCancel ? (
              <button type="button" className="provision-device__btn provision-device__btn--cancel" onClick={onCancel}>
                Cancel Provisioning
              </button>
            ) : (
              <Link to={cancelHref} className="provision-device__btn provision-device__btn--cancel">
                Cancel Provisioning
              </Link>
            )}
          </div>

          <div className="provision-device__tip">
            <IconTip />
            <div>
              <p className="provision-device__tip-title">Provisioning Tip</p>
              <p className="provision-device__tip-text">
                Ensure the device is powered on and connected to the &apos;Bukalabs_Secure&apos; network before
                attempting to register. MAC addresses are automatically validated against our central registry.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );

  if (isOverlay) {
    return <div className="provision-device-panel">{content}</div>;
  }

  return <div className="admin-shell__content provision-device">{content}</div>;
}
