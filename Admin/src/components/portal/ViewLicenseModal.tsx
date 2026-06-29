import { Link } from "react-router-dom";
import FigmaModal from "./FigmaModal";
import { copyToClipboard } from "../../utils/copyToClipboard";
import {
  buildLicenseDetailsFromRow,
  buildLicenseDetailsFromSerialKey,
  type LicenseDetailsView,
} from "../../data/licenseDetailsDisplay";
import { useNotificationStore } from "../../store/notificationStore";
import type { AdminUser, SerialKey } from "../../types";
import closeIcon from "../../icons/Modal Header/Icon-209.svg";
import copyIcon from "../../icons/generate-keys-copy-icon.svg";
import "../../styles/view-license-modal.css";

type RowInput = {
  id: string | number;
  key: string;
  user: string;
  status: string;
  date: string;
};

type Props = {
  closeTo?: string;
  onClose?: () => void;
  row?: RowInput | null;
  serialKey?: SerialKey | null;
  users?: AdminUser[];
  editDetailsTo?: string;
  onEditDetails?: () => void;
  onUserClick?: () => void;
};

function IconChevronRight() {
  return (
    <svg className="view-license__user-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function resolveDetails(props: Props): LicenseDetailsView | null {
  if (props.serialKey) {
    return buildLicenseDetailsFromSerialKey(props.serialKey, props.users);
  }

  if (props.row) {
    return buildLicenseDetailsFromRow(props.row);
  }

  return buildLicenseDetailsFromRow({
    id: "",
    key: "",
    user: "",
    status: "unused",
    date: "",
  });
}

export default function ViewLicenseModal({
  closeTo = "/license-key-management-2226-2536",
  onClose,
  row,
  serialKey,
  users,
  editDetailsTo,
  onEditDetails,
  onUserClick,
}: Props) {
  const push = useNotificationStore((s) => s.push);
  const details = resolveDetails({ row, serialKey, users });

  if (!details) return null;

  const handleCopy = () => {
    copyToClipboard(details.licenseKey);
    push("Serial key copied", "success");
  };

  const footer = (
    <div className="view-license__footer">
      {onClose ? (
        <button type="button" className="figma-btn figma-btn--secondary" onClick={onClose}>
          Close
        </button>
      ) : (
        <Link to={closeTo} className="figma-btn figma-btn--secondary">
          Close
        </Link>
      )}
      <div className="view-license__footer-actions">
        {onEditDetails ? (
          <button type="button" className="figma-btn figma-btn--primary" onClick={onEditDetails}>
            Edit Details
          </button>
        ) : editDetailsTo ? (
          <Link to={editDetailsTo} className="figma-btn figma-btn--primary">
            Edit Details
          </Link>
        ) : (
          <Link to="/user-management-edit-user-modal" className="figma-btn figma-btn--primary">
            Edit Details
          </Link>
        )}
      </div>
    </div>
  );

  const userCard = details.hasAssignedUser ? (
    onUserClick ? (
      <button type="button" className="view-license__user-card" onClick={onUserClick}>
        <img className="view-license__avatar" src={details.assignedUserAvatar} alt="" />
        <div className="view-license__user-meta">
          <div className="view-license__user-name">{details.assignedUserName}</div>
          <div className="view-license__user-title">{details.assignedUserTitle}</div>
        </div>
        <IconChevronRight />
      </button>
    ) : (
      <div className="view-license__user-card view-license__user-card--static">
        <img className="view-license__avatar" src={details.assignedUserAvatar} alt="" />
        <div className="view-license__user-meta">
          <div className="view-license__user-name">{details.assignedUserName}</div>
          <div className="view-license__user-title">{details.assignedUserTitle}</div>
        </div>
        <IconChevronRight />
      </div>
    )
  ) : (
    <div className="view-license__user-card view-license__user-card--static" aria-disabled="true">
      <div className="view-license__user-meta">
        <div className="view-license__user-name">{details.assignedUserName}</div>
        <div className="view-license__user-title">{details.assignedUserTitle}</div>
      </div>
    </div>
  );

  return (
    <FigmaModal
      className="figma-modal--view-license"
      eyebrow="Serial Details"
      title="View Serial"
      onClose={onClose ? undefined : closeTo}
      onDismiss={onClose}
      closeIcon={<img src={closeIcon} alt="" aria-hidden="true" />}
      footer={footer}
      footerClassName="view-license__footer-wrap"
    >
      <div className="view-license__status-bar">
        <span className={`view-license__status-badge view-license__status-badge--${details.statusVariant}`}>
          {details.statusLabel}
        </span>
        <div className="view-license__identifier">
          <span className="view-license__identifier-label">Key Identifier</span>
          <span className="view-license__identifier-value">{details.keyIdentifier}</span>
        </div>
      </div>

      <div className="view-license__field">
        <span className="view-license__field-label">Serial Key</span>
        <div className="view-license__key-wrap">
          <span className="view-license__key-value">{details.licenseKey}</span>
          <button type="button" className="view-license__copy-btn" aria-label="Copy serial key" onClick={handleCopy}>
            <img src={copyIcon} alt="" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="view-license__field">
        <span className="view-license__field-label">Assigned User</span>
        {userCard}
      </div>

      <div className="view-license__dates">
        <div>
          <span className="view-license__date-label">Date Assigned</span>
          <span className="view-license__date-value">{details.dateAssigned}</span>
        </div>
        <div>
          <span className="view-license__date-label">Expiry Date</span>
          <span className="view-license__date-value">{details.expiryDate}</span>
        </div>
      </div>
    </FigmaModal>
  );
}
