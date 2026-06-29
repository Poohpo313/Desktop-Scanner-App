import { Link } from "react-router-dom";
import FigmaModal from "./FigmaModal";
import type { SerialKey } from "../../types";
import closeIcon from "../../icons/Modal Header/Icon-209.svg";
import "../../styles/deactivate-key-modal.css";

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
  clusterName?: string;
};

function IconWarningTriangle() {
  return (
    <svg className="deactivate-key__warning-icon" width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
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
    <svg className="deactivate-key__callout-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.25" />
      <path d="M8 7V11" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <circle cx="8" cy="5" r="0.75" fill="currentColor" />
    </svg>
  );
}

function resolveKeyIdentifier(props: Props): string {
  if (props.keyIdentifier) return props.keyIdentifier;
  if (props.row?.id != null) return String(props.row.id);
  if (props.serialKey) return `KEY${String(props.serialKey.serialId).padStart(3, "0")}`;
  return "KEY001";
}

export default function DeactivateKeyModal({
  closeTo = "/license-key-management-2226-2536",
  confirmTo = "/license-key-management-2226-2536",
  onClose,
  onConfirm,
  row,
  serialKey,
  keyIdentifier,
  clusterName = "Main Server Cluster",
}: Props) {
  const resolvedKeyId = resolveKeyIdentifier({ row, serialKey, keyIdentifier });
  const warningText = `Deactivating this key will immediately revoke all access permissions for the ${clusterName}. This action cannot be undone by local admins.`;

  const footer = (
    <>
      {onClose ? (
        <button type="button" className="figma-btn figma-btn--ghost" onClick={onClose}>
          Cancel
        </button>
      ) : (
        <Link to={closeTo} className="figma-btn figma-btn--ghost">
          Cancel
        </Link>
      )}
      {onConfirm ? (
        <button type="button" className="figma-btn figma-btn--danger" onClick={onConfirm}>
          Deactivate
        </button>
      ) : (
        <Link to={confirmTo} className="figma-btn figma-btn--danger">
          Deactivate
        </Link>
      )}
    </>
  );

  const closeControl = onClose ? (
    <button type="button" className="deactivate-key__close" aria-label="Close" onClick={onClose}>
      <img src={closeIcon} alt="" aria-hidden="true" />
    </button>
  ) : (
    <Link to={closeTo} className="deactivate-key__close" aria-label="Close">
      <img src={closeIcon} alt="" aria-hidden="true" />
    </Link>
  );

  return (
    <FigmaModal
      className="figma-modal--deactivate-key"
      hideHeader
      hideClose
      onDismiss={onClose}
      footer={footer}
      footerClassName="deactivate-key__footer-wrap"
    >
      {closeControl}

      <div className="deactivate-key__icon-wrap" aria-hidden="true">
        <IconWarningTriangle />
      </div>

      <h2 id="figma-modal-title" className="deactivate-key__title">
        Deactivate Key
      </h2>

      <p className="deactivate-key__question">
        Are you sure you want to deactivate <strong>{resolvedKeyId}</strong>?
      </p>

      <div className="deactivate-key__callout" role="note">
        <IconWarningInfo />
        <p className="deactivate-key__callout-text">{warningText}</p>
      </div>
    </FigmaModal>
  );
}
