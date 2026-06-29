import {
  IconActivityCheck,
  IconActivityDevice,
  IconActivityKey,
  IconActivityUser,
  IconSearch,
} from "../icons/AdminIcons";
import {
  ACTIVITY_LOGS,
  exportActivityLogsCsv,
  filterActivityLogs,
  type ActivityLogEntry,
  type ActivityLogIcon,
} from "../../data/activityLogsFleet";
import "../../styles/activity-logs.css";

type Props = {
  logs?: ActivityLogEntry[];
  query?: string;
  onQueryChange?: (value: string) => void;
  showToolbar?: boolean;
};

function ActivityLogIcon({ type }: { type: ActivityLogIcon }) {
  const cls = "activity-logs__icon";

  if (type === "user") {
    return (
      <span className={`${cls} activity-logs__icon--mint`}>
        <IconActivityUser />
      </span>
    );
  }

  if (type === "key") {
    return (
      <span className={`${cls} activity-logs__icon--mint`}>
        <IconActivityKey />
      </span>
    );
  }

  if (type === "device") {
    return (
      <span className={`${cls} activity-logs__icon--mint`}>
        <IconActivityDevice />
      </span>
    );
  }

  if (type === "security") {
    return (
      <span className={`${cls} activity-logs__icon--alert`} aria-hidden="true">
        !
      </span>
    );
  }

  if (type === "settings") {
    return (
      <span className={`${cls} activity-logs__icon--gray`} aria-hidden="true">
        ⚙
      </span>
    );
  }

  return (
    <span className={`${cls} activity-logs__icon--gray`}>
      <IconActivityCheck />
    </span>
  );
}

export default function ActivityLogsBody({
  logs = ACTIVITY_LOGS,
  query = "",
  onQueryChange,
  showToolbar = true,
}: Props) {
  const filteredLogs = filterActivityLogs(logs, query);

  return (
    <div className="activity-logs">
      {showToolbar && (
        <div className="activity-logs__toolbar">
          <label className="activity-logs__search">
            <IconSearch className="activity-logs__search-icon" />
            <input
              type="search"
              value={query}
              onChange={(event) => onQueryChange?.(event.target.value)}
              placeholder="Search by action, actor, or details..."
              aria-label="Search activity logs"
            />
          </label>
          <button
            type="button"
            className="figma-btn figma-btn--secondary activity-logs__export-btn"
            onClick={() => exportActivityLogsCsv(filteredLogs)}
          >
            Export CSV
          </button>
        </div>
      )}

      <div className="activity-logs__list" role="list">
        {filteredLogs.map((log) => (
          <article key={log.id} className="activity-logs__item" role="listitem">
            <ActivityLogIcon type={log.icon} />
            <div className="activity-logs__content">
              <div className="activity-logs__head">
                <h3 className="activity-logs__action">{log.action}</h3>
                <time className="activity-logs__time" dateTime={log.timestamp}>
                  {log.time}
                </time>
              </div>
              <p className="activity-logs__details">{log.details}</p>
              <div className="activity-logs__meta">
                <span className="activity-logs__actor">{log.actor}</span>
                <span className="activity-logs__timestamp">{log.timestamp}</span>
              </div>
            </div>
          </article>
        ))}
        {filteredLogs.length === 0 && (
          <p className="activity-logs__empty">No activity logs match your search.</p>
        )}
      </div>
    </div>
  );
}
