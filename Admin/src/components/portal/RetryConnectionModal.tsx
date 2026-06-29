import { Link } from "react-router-dom";
import FigmaModal from "./FigmaModal";
import closeIcon from "../../icons/Modal Header/Icon-209.svg";
import type { DeviceTypeVariant } from "../../data/demoDevices";
import "../../styles/retry-connection-modal.css";

type Props = {
  closeTo?: string;
  onClose?: () => void;
  onRetry?: () => void;
  deviceName?: string;
  deviceType?: DeviceTypeVariant;
};

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

function IconTerminal() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M6.5 8L9.5 11L6.5 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.5 14H15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconPrinter() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="5.5" y="8.5" width="11" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 8.5V6.75C7 5.9 7.7 5.2 8.55 5.2H13.45C14.3 5.2 15 5.9 15 6.75V8.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="7.5" y="11.5" width="7" height="4" rx="0.6" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 15.5H14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconScanner() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="5" y="7" width="12" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7.5 10.5H14.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M7.5 12.5H12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M8 15.5H14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconError() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="8" fill="#d64541" />
      <path d="M9 5.25V9.75" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="9" cy="12.25" r="0.85" fill="white" />
    </svg>
  );
}

export default function RetryConnectionModal({
  closeTo = "/device-management",
  onClose,
  onRetry,
  deviceName = "",
  deviceType = "output",
}: Props) {
  const DeviceIcon = deviceType === "output" ? IconPrinter : IconScanner;
  const deviceLabel = deviceName.toUpperCase();

  const handleRetry = () => {
    onRetry?.();
    onClose?.();
  };

  const footer = (
    <>
      {onClose ? (
        <button type="button" className="retry-connection__cancel-btn" onClick={onClose}>
          Cancel
        </button>
      ) : (
        <Link to={closeTo} className="retry-connection__cancel-btn">
          Cancel
        </Link>
      )}
      {onClose ? (
        <button type="button" className="figma-btn figma-btn--primary retry-connection__retry-btn" onClick={handleRetry}>
          <IconRetry className="retry-connection__retry-icon" />
          Retry Now
        </button>
      ) : (
        <Link to={closeTo} className="figma-btn figma-btn--primary retry-connection__retry-btn">
          <IconRetry className="retry-connection__retry-icon" />
          Retry Now
        </Link>
      )}
    </>
  );

  return (
    <FigmaModal
      className="figma-modal--retry-connection"
      title="Retry Connection Modal"
      onClose={onClose ? undefined : closeTo}
      onDismiss={onClose}
      closeIcon={<img src={closeIcon} alt="" aria-hidden="true" />}
      footer={footer}
      footerClassName="retry-connection__footer-wrap"
    >
      <div className="retry-connection__diagram" aria-hidden="true">
        <div className="retry-connection__endpoint">
          <div className="retry-connection__node retry-connection__node--terminal">
            <IconTerminal />
          </div>
          <span className="retry-connection__node-label">Terminal</span>
        </div>

        <div className="retry-connection__bridge">
          <span className="retry-connection__line" />
          <span className="retry-connection__fail">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M2.5 2.5L7.5 7.5M7.5 2.5L2.5 7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </span>
          <span className="retry-connection__line" />
        </div>

        <div className="retry-connection__endpoint">
          <div className="retry-connection__node retry-connection__node--device">
            <DeviceIcon />
          </div>
          <span className="retry-connection__node-label">{deviceLabel}</span>
        </div>
      </div>

      <p className="retry-connection__message">
        Connection failed for <strong>{deviceName}</strong>. Would you like to attempt a reconnection?
      </p>

      <div className="retry-connection__error" role="alert">
        <IconError />
        <div>
          <p className="retry-connection__error-title">Status Error</p>
          <p className="retry-connection__error-code">Error Code: ERR_CONN_TIMEOUT</p>
        </div>
      </div>

      <p className="retry-connection__sync">Last sync attempt: 2 minutes ago</p>
    </FigmaModal>
  );
}
