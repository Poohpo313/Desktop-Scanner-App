import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import FigmaModal from "./FigmaModal";
import ActivityLogsBody from "./ActivityLogsBody";
import {
  ACTIVITY_LOGS,
  filterActivityLogs,
  type ActivityLogEntry,
} from "../../data/activityLogsFleet";
import closeIcon from "../../icons/Modal Header/Icon-209.svg";
import "../../styles/activity-logs-modal.css";

type Props = {
  closeTo?: string;
  onClose?: () => void;
  logs?: ActivityLogEntry[];
};

export default function ActivityLogsModal({
  closeTo = "/admin-dashboard-2226-1193",
  onClose,
  logs = ACTIVITY_LOGS,
}: Props) {
  const [query, setQuery] = useState("");
  const filteredLogs = useMemo(() => filterActivityLogs(logs, query), [logs, query]);

  const footer = (
    <div className="activity-logs-modal__footer">
      <p className="activity-logs-modal__count">
        Showing {filteredLogs.length} of {logs.length} activity events
      </p>
      <div className="activity-logs-modal__footer-actions">
        {onClose ? (
          <button type="button" className="figma-btn figma-btn--primary" onClick={onClose}>
            Done
          </button>
        ) : (
          <Link to={closeTo} className="figma-btn figma-btn--primary">
            Done
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <FigmaModal
      className="figma-modal--activity-logs"
      title="Activity Logs"
      subtitle={`${logs.length} events recorded across your enterprise console`}
      wide
      onClose={onClose ? undefined : closeTo}
      onDismiss={onClose}
      closeIcon={<img src={closeIcon} alt="" aria-hidden="true" />}
      footer={footer}
      footerClassName="activity-logs-modal__footer-wrap"
    >
      <ActivityLogsBody
        logs={logs}
        query={query}
        onQueryChange={setQuery}
        showToolbar
      />
    </FigmaModal>
  );
}
