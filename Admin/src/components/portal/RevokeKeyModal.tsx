import { Link } from "react-router-dom";
import FigmaModal from "./FigmaModal";
import type { SerialKey } from "../../types";
import closeIcon from "../../icons/Modal Header/Icon-209.svg";
import "../../styles/revoke-key-modal.css";

type RowInput = {
  id: string | number;
};

type Props = {
  closeTo?: string;
  confirmTo?: string;
  onClose?: () => void;
  onConfirm?: () => void;
  row?: RowInput | null;
  serialKey?: SerialKey | null;
  keyIdentifier?: string;
};

function IconWarningTriangle() {
  return (
    <svg className="revoke-key__warning-icon" width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path
        d="M14 6L24.5 22.5H3.5L14 6Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M14 12V16.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="14" cy="19.5" r="1" fill="currentColor" />
    </svg>
  );
}

function IconWarningInfo() {
  return (
    <svg className="revoke-key__callout-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.25" />
      <path d="M8 7V11" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <circle cx="8" cy="5" r="0.75" fill="currentColor" />
    </svg>
  );
}

function IconRevoke() {
  return (
    <svg className="revoke-key__action-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M5.5 2.5H10.5L11 4.5H13V5.5H12.5L12 13.5H4L3.5 5.5H3V4.5H5L5.5 2.5Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path d="M6.5 7V11" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M9.5 7V11" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function resolveKeyIdentifier(props: Props): string {
  if (props.keyIdentifier) return props.keyIdentifier;
  if (props.row?.id != null) return String(props.row.id);
  if (props.serialKey) return `KEY${String(props.serialKey.serialId).padStart(3, "0")}`;
  return "KEY001";
}

export default function RevokeKeyModal({
  closeTo = "/license-key-management-2226-2536",
  confirmTo = "/license-key-management-2226-2536",
  onClose,
  onConfirm,
  row,
  serialKey,
  keyIdentifier,
}: Props) {
  const resolvedKeyId = resolveKeyIdentifier({ row, serialKey, keyIdentifier });

  const footer = (
    <>
      {onClose ? (
        <button type="button" className="figma-btn revoke-key__cancel" onClick={onClose}>
          Cancel
        </button>
      ) : (
        <Link to={closeTo} className="figma-btn revoke-key__cancel">
          Cancel
        </Link>
      )}
      {onConfirm ? (
        <button type="button" className="figma-btn figma-btn--danger" onClick={onConfirm}>
          <IconRevoke />
          Revoke
        </button>
      ) : (
        <Link to={confirmTo} className="figma-btn figma-btn--danger">
          <IconRevoke />
          Revoke
        </Link>
      )}
    </>
  );

  const closeControl = onClose ? (
    <button type="button" className="revoke-key__close" aria-label="Close" onClick={onClose}>
      <img src={closeIcon} alt="" aria-hidden="true" />
    </button>
  ) : (
    <Link to={closeTo} className="revoke-key__close" aria-label="Close">
      <img src={closeIcon} alt="" aria-hidden="true" />
    </Link>
  );

  return (
    <FigmaModal
      className="figma-modal--revoke-key"
      hideHeader
      hideClose
      onDismiss={onClose}
      footer={footer}
      footerClassName="revoke-key__footer-wrap"
    >
      {closeControl}

      <div className="revoke-key__icon-wrap" aria-hidden="true">
        <IconWarningTriangle />
      </div>

      <h2 id="figma-modal-title" className="revoke-key__title">
        Revoke Key
      </h2>

      <p className="revoke-key__question">
        Are you sure you want to revoke <strong>{resolvedKeyId}</strong>?
      </p>

      <div className="revoke-key__callout" role="note">
        <IconWarningInfo />
        <p className="revoke-key__callout-text">This action cannot be undone.</p>
      </div>
    </FigmaModal>
  );
}
