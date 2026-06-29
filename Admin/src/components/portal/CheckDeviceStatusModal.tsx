import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FigmaModal from "./FigmaModal";
import closeIcon from "../../icons/Modal Header/Icon-209.svg";
import "../../styles/check-device-status-modal.css";

type Props = {
  closeTo?: string;
  onClose?: () => void;
  onRefresh?: () => void;
  deviceName?: string;
  networkIdentity?: string;
};

function IconBroadcast() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="2.25" fill="currentColor" />
      <path
        d="M9.5 9.5C10.85 8.15 12.35 7.5 14 7.5C15.65 7.5 17.15 8.15 18.5 9.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M6.75 6.75C8.85 4.65 11.35 3.5 14 3.5C16.65 3.5 19.15 4.65 21.25 6.75"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M11.75 11.75C12.45 11.05 13.2 10.75 14 10.75C14.8 10.75 15.55 11.05 16.25 11.75"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconRetry({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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

function IconLatency() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 11.75A4 4 0 0 1 12 11.75H4Z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 11.75L10.15 8.9" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}

function IconRouter() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M5.5 4.25C6.35 3.4 7.15 3 8 3C8.85 3 9.65 3.4 10.5 4.25"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <rect x="3" y="5.75" width="10" height="5.75" rx="1.1" stroke="currentColor" strokeWidth="1.15" />
      <circle cx="5.5" cy="8.6" r="0.7" fill="currentColor" />
      <circle cx="8" cy="8.6" r="0.7" fill="currentColor" />
      <circle cx="10.5" cy="8.6" r="0.7" fill="currentColor" />
      <path d="M6 11.75H10" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
    </svg>
  );
}

export default function CheckDeviceStatusModal({
  closeTo = "/device-management",
  onClose,
  onRefresh,
  deviceName = "",
  networkIdentity = "KS-SEC-0042",
}: Props) {
  const [progress, setProgress] = useState(0);

  const runProgress = () => {
    setProgress(0);
    const start = window.setTimeout(() => {
      setProgress(44);
    }, 80);
    return () => window.clearTimeout(start);
  };

  useEffect(() => {
    return runProgress();
  }, [deviceName, networkIdentity]);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
    runProgress();
  };

  const footer = (
    <>
      {onClose ? (
        <button type="button" className="figma-btn figma-btn--secondary check-status__cancel-btn" onClick={onClose}>
          Cancel
        </button>
      ) : (
        <Link to={closeTo} className="figma-btn figma-btn--secondary check-status__cancel-btn">
          Cancel
        </Link>
      )}
      <button type="button" className="figma-btn figma-btn--primary check-status__refresh-btn" onClick={handleRefresh}>
        <IconRetry className="check-status__refresh-icon" />
        Refresh
      </button>
    </>
  );

  return (
    <FigmaModal
      className="figma-modal--check-status"
      title="Check Status"
      onClose={onClose ? undefined : closeTo}
      onDismiss={onClose}
      closeIcon={<img src={closeIcon} alt="" aria-hidden="true" />}
      footer={footer}
      footerClassName="check-status__footer-wrap"
    >
      <div className="check-status__hero">
        <div className="check-status__hero-icon" aria-hidden="true">
          <IconBroadcast />
        </div>
        <h3 className="check-status__device-name">{deviceName}</h3>
        <p className="check-status__network-id">Network Identity: {networkIdentity}</p>
      </div>

      <div className="check-status__progress-block">
        <div className="check-status__progress-head">
          <span className="check-status__progress-label">
            <IconRetry className="check-status__progress-icon" />
            Pinging host...
          </span>
          <span className="check-status__progress-value">{progress}%</span>
        </div>
        <div className="check-status__progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="check-status__progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="check-status__metrics">
        <div className="check-status__metric-card">
          <span className="check-status__metric-icon-wrap" aria-hidden="true">
            <IconLatency />
          </span>
          <div>
            <p className="check-status__metric-label">Latency</p>
            <p className="check-status__metric-value">12ms</p>
          </div>
        </div>
        <div className="check-status__metric-card">
          <span className="check-status__metric-icon-wrap" aria-hidden="true">
            <IconRouter />
          </span>
          <div>
            <p className="check-status__metric-label">Packets</p>
            <p className="check-status__metric-value">Stable</p>
          </div>
        </div>
      </div>
    </FigmaModal>
  );
}
