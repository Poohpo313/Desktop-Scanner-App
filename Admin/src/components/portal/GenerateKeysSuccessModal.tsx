import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FigmaModal from "./FigmaModal";
import { copyToClipboard } from "../../utils/copyToClipboard";
import { exportLicenseKey, type LicenseExportFormat } from "../../utils/exportLicenseKey";
import { useNotificationStore } from "../../store/notificationStore";
import closeIcon from "../../icons/Modal Header/Icon-209.svg";
import successCheckIcon from "../../icons/login/email-success-check.svg";
import calendarIcon from "../../icons/generate-keys-expiry-calendar.svg";
import copyIcon from "../../icons/generate-keys-copy-icon.svg";
import brandIcon from "../../icons/Footer Brand/Footer Brand/Icon-41.svg";
import type { LicenseKeyDisplay } from "../../utils/licenseKeyDisplay";
import { FIGMA_LICENSE_DISPLAY } from "../../utils/licenseKeyDisplay";
import "../../styles/generate-keys-success-modal.css";

type Props = {
  closeTo?: string;
  confirmTo?: string;
  onClose?: () => void;
  onConfirm?: () => void | Promise<void>;
  license?: Partial<LicenseKeyDisplay>;
  saving?: boolean;
};

function IconCopy({ className }: { className?: string }) {
  return <img src={copyIcon} alt="" aria-hidden="true" className={className} draggable={false} />;
}

function IconExport({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1.33333L8 10M8 1.33333L5.33333 4M8 1.33333L10.6667 4M2.66667 10V13.3333C2.66667 13.7 2.79667 14.0139 3.05667 14.275C3.31667 14.5361 3.63056 14.6667 4 14.6667H12C12.3694 14.6667 12.6833 14.5361 12.9433 14.275C13.2033 14.0139 13.3333 13.7 13.3333 13.3333V10"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const EXPORT_FORMATS: { id: LicenseExportFormat; label: string }[] = [
  { id: "pdf", label: "PDF" },
  { id: "docx", label: "DOCX" },
  { id: "txt", label: "TXT" },
];

export default function GenerateKeysSuccessModal({
  closeTo = "/admin-dashboard-2226-1193",
  confirmTo,
  onClose,
  onConfirm,
  license,
  saving = false,
}: Props) {
  const navigate = useNavigate();
  const push = useNotificationStore((s) => s.push);
  const exportWrapRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const data: LicenseKeyDisplay = { ...FIGMA_LICENSE_DISPLAY, ...license };

  useEffect(() => {
    if (!exportMenuOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (exportWrapRef.current && target && !exportWrapRef.current.contains(target)) {
        setExportMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [exportMenuOpen]);

  const handleCopy = () => {
    copyToClipboard(data.keyValue);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleExportFormat = (format: LicenseExportFormat) => {
    exportLicenseKey(data, format);
    setExportMenuOpen(false);
    push(`Serial exported as ${format.toUpperCase()}`, "success");
  };

  const handleDone = async () => {
    if (saving) return;

    if (onConfirm) {
      await onConfirm();
      return;
    }

    if (onClose) {
      onClose();
      return;
    }

    if (confirmTo) {
      navigate(confirmTo);
    }
  };

  const doneButton =
    onClose || onConfirm ? (
      <button
        type="button"
        className="figma-btn figma-btn--primary figma-btn--block gen-keys-success__done"
        onClick={() => void handleDone()}
        disabled={saving}
      >
        {saving ? "Saving..." : "Done"}
      </button>
    ) : (
      <Link to={confirmTo ?? closeTo} className="figma-btn figma-btn--primary figma-btn--block gen-keys-success__done">
        Done
      </Link>
    );

  const footer = (
    <div className="gen-keys-success__footer">
      <div className="gen-keys-success__secondary-row">
        <button
          type="button"
          className={`figma-btn figma-btn--outline-green gen-keys-success__secondary-btn${copied ? " gen-keys-success__secondary-btn--copied" : ""}`}
          onClick={handleCopy}
        >
          <IconCopy className="gen-keys-success__btn-icon" />
          {copied ? "Copied" : "Copy"}
        </button>
        <div className="gen-keys-success__export-wrap" ref={exportWrapRef}>
          <button
            type="button"
            className={`figma-btn figma-btn--outline-green gen-keys-success__secondary-btn${exportMenuOpen ? " gen-keys-success__secondary-btn--active" : ""}`}
            aria-haspopup="menu"
            aria-expanded={exportMenuOpen}
            onClick={() => setExportMenuOpen((open) => !open)}
          >
            <IconExport className="gen-keys-success__btn-icon" />
            Export
          </button>
          {exportMenuOpen && (
            <div className="gen-keys-success__export-menu" role="menu" aria-label="Export format">
              <p className="gen-keys-success__export-menu-title">Export as</p>
              {EXPORT_FORMATS.map((format) => (
                <button
                  key={format.id}
                  type="button"
                  role="menuitem"
                  className="gen-keys-success__export-option"
                  onClick={() => handleExportFormat(format.id)}
                >
                  {format.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {doneButton}
      <div className="gen-keys-success__brand">
        <img src={brandIcon} alt="" aria-hidden="true" className="gen-keys-success__brand-icon" />
        <span>Enterprise Secure Serial V4.0</span>
      </div>
    </div>
  );

  return (
    <FigmaModal
      className="figma-modal--generate-keys-success"
      onClose={onClose ? undefined : closeTo}
      onDismiss={onClose}
      closeIcon={<img src={closeIcon} alt="" aria-hidden="true" />}
      footer={footer}
      footerClassName="gen-keys-success__footer-wrap"
    >
      <div className="gen-keys-success__hero">
        <img src={successCheckIcon} alt="" aria-hidden="true" className="gen-keys-success__check" />
        <p className="gen-keys-success__message">
          Your new serial key is ready to be assigned to a device or user.
        </p>
      </div>

      <div className="gen-keys-success__meta">
        <div className="gen-keys-success__meta-item">
          <span className="gen-keys-success__label">Key ID</span>
          <span className="gen-keys-success__value">{data.keyId}</span>
        </div>
        <div className="gen-keys-success__meta-item gen-keys-success__meta-item--status">
          <span className="gen-keys-success__label">Status</span>
          <span className="gen-keys-success__status">{data.status}</span>
        </div>
      </div>

      <div className="gen-keys-success__field-block">
        <span className="gen-keys-success__label">Key Value</span>
        <div className="gen-keys-success__value-box">
          <span className="gen-keys-success__key-value">{data.keyValue}</span>
        </div>
      </div>

      <div className="gen-keys-success__expiry-box">
        <img src={calendarIcon} alt="" aria-hidden="true" className="gen-keys-success__calendar-icon" />
        <div className="gen-keys-success__expiry-content">
          <span className="gen-keys-success__label">Expiry Date</span>
          <span className="gen-keys-success__expiry-value">{data.expiryDate}</span>
        </div>
      </div>
    </FigmaModal>
  );
}
