import Modal from "./Modal";
import {
  formatConcernRating,
  formatConcernType,
  type HelpRequestRow,
} from "../lib/helpMappers";
import "../styles/help-request-detail-modal.css";

type Props = {
  open: boolean;
  request: HelpRequestRow | null;
  onClose: () => void;
};

export default function HelpRequestDetailModal({ open, request, onClose }: Props) {
  if (!request) return null;

  const ratingLabel = formatConcernRating(request.rating);

  return (
    <Modal open={open} title={request.subject} onClose={onClose}>
      <div className="help-request-detail">
        <div className="help-request-detail__header">
          <span className={`help-status-badge help-status-badge--${request.status.toLowerCase().replace(/\s+/g, "-")}`}>
            {request.status}
          </span>
        </div>

        <dl className="help-request-detail__grid">
          <div>
            <dt>User</dt>
            <dd>{request.serialKey}</dd>
          </div>
          <div>
            <dt>Organization</dt>
            <dd>{request.organization}</dd>
          </div>
          <div>
            <dt>Department</dt>
            <dd>{request.department}</dd>
          </div>
          <div>
            <dt>Concern type</dt>
            <dd>{formatConcernType(request.concernType)}</dd>
          </div>
          <div>
            <dt>Category</dt>
            <dd>{request.category}</dd>
          </div>
          <div>
            <dt>Submitted</dt>
            <dd>
              {request.date} {request.timeLine}
            </dd>
          </div>
          {request.email ? (
            <div>
              <dt>Email</dt>
              <dd>{request.email}</dd>
            </div>
          ) : null}
          {ratingLabel ? (
            <div>
              <dt>Rating</dt>
              <dd>{ratingLabel}</dd>
            </div>
          ) : null}
        </dl>

        <div className="help-request-detail__message-block">
          <span className="help-request-detail__message-label">Message</span>
          <p className="help-request-detail__message">{request.message}</p>
        </div>

        <div className="help-request-detail__actions">
          <button type="button" className="help-request-detail__close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
