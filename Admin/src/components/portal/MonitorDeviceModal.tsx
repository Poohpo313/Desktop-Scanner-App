import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FigmaModal from "./FigmaModal";
import closeIcon from "../../icons/Modal Header/Icon-209.svg";
import "../../styles/monitor-device-modal.css";

type Props = {
  closeTo?: string;
  onClose?: () => void;
  onRefresh?: () => void;
  deviceName?: string;
  networkIdentity?: string;
};

function IconHeaderSignal() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="1.35" fill="currentColor" />
      <path
        d="M5.25 5.25C6.15 4.35 7 4 8 4C9 4 9.85 4.35 10.75 5.25"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M3.5 3.5C5.05 1.95 6.45 1.25 8 1.25C9.55 1.25 10.95 1.95 12.5 3.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconBarcode() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <path d="M6 10V24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 10V24" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M13 10V24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 10V24" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M18.5 10V24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M21.5 10V24" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M24.5 10V24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 10V24" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
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

function IconGauge() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 11.75A4 4 0 0 1 12 11.75H4Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 11.75L10.2 8.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconPackets() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3.25V7.25M8 8.75V12.75" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <path d="M5.75 5.25L8 3.25L10.25 5.25" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.75 10.75L8 12.75L10.25 10.75" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function MonitorDeviceModal({
  closeTo = "/device-management",
  onClose,
  onRefresh,
  deviceName: _deviceName = "",
  networkIdentity: _networkIdentity = "",
}: Props) {
  const [ringProgress, setRingProgress] = useState(0);
  const [barProgress, setBarProgress] = useState(0);

  const runProgress = () => {
    setRingProgress(0);
    setBarProgress(0);
    const ringTimer = window.setTimeout(() => setRingProgress(78), 80);
    const barTimer = window.setTimeout(() => setBarProgress(66), 120);
    return () => {
      window.clearTimeout(ringTimer);
      window.clearTimeout(barTimer);
    };
  };

  useEffect(() => {
    return runProgress();
  }, [_deviceName, _networkIdentity]);

  const handleRefresh = () => {
    onRefresh?.();
    runProgress();
  };

  const footer = (
    <>
      {onClose ? (
        <button type="button" className="figma-btn monitor-device__cancel-btn" onClick={onClose}>
          Cancel
        </button>
      ) : (
        <Link to={closeTo} className="figma-btn monitor-device__cancel-btn">
          Cancel
        </Link>
      )}
      <button type="button" className="figma-btn figma-btn--primary monitor-device__refresh-btn" onClick={handleRefresh}>
        <IconRetry className="monitor-device__refresh-icon" />
        Refresh
      </button>
    </>
  );

  return (
    <FigmaModal
      className="figma-modal--monitor-device"
      title="Monitor Device"
      headerIcon={<IconHeaderSignal />}
      onClose={onClose ? undefined : closeTo}
      onDismiss={onClose}
      closeIcon={<img src={closeIcon} alt="" aria-hidden="true" />}
      footer={footer}
      footerClassName="monitor-device__footer-wrap"
    >
      <div className="monitor-device__hero">
        <div className="monitor-device__ring-wrap" aria-hidden="true">
          <svg className="monitor-device__ring" viewBox="0 0 120 120">
            <circle className="monitor-device__ring-track" cx="60" cy="60" r="52" />
            <circle
              className="monitor-device__ring-fill"
              cx="60"
              cy="60"
              r="52"
              style={{ strokeDashoffset: 327 - (327 * ringProgress) / 100 }}
            />
          </svg>
          <div className="monitor-device__circle">
            <IconBarcode />
          </div>
        </div>
        <p className="monitor-device__percent">{ringProgress}%</p>
        <p className="monitor-device__status">System Monitoring in Progress</p>
      </div>

      <div className="monitor-device__progress-block">
        <div className="monitor-device__progress-head">
          <span className="monitor-device__progress-label">Pinging host system...</span>
          <span className="monitor-device__progress-value">{barProgress}%</span>
        </div>
        <div className="monitor-device__progress-track" role="progressbar" aria-valuenow={barProgress} aria-valuemin={0} aria-valuemax={100}>
          <div className="monitor-device__progress-fill" style={{ width: `${barProgress}%` }} />
        </div>
      </div>

      <div className="monitor-device__metrics">
        <div className="monitor-device__metric-card">
          <div className="monitor-device__metric-head">
            <span className="monitor-device__metric-icon-wrap monitor-device__metric-icon-wrap--green" aria-hidden="true">
              <IconGauge />
            </span>
            <span className="monitor-device__metric-label monitor-device__metric-label--green">Latency</span>
          </div>
          <p className="monitor-device__metric-value">12ms</p>
          <p className="monitor-device__metric-sub monitor-device__metric-sub--green">Excellent Connection</p>
        </div>
        <div className="monitor-device__metric-card">
          <div className="monitor-device__metric-head">
            <span className="monitor-device__metric-icon-wrap monitor-device__metric-icon-wrap--green" aria-hidden="true">
              <IconPackets />
            </span>
            <span className="monitor-device__metric-label monitor-device__metric-label--green">Packets</span>
          </div>
          <p className="monitor-device__metric-value">Stable</p>
          <p className="monitor-device__metric-sub monitor-device__metric-sub--green">0% Loss</p>
        </div>
      </div>

      <div className="monitor-device__handle" aria-hidden="true" />
    </FigmaModal>
  );
}
