import { Link } from "react-router-dom";
import type { UserActivityEntry, UserDetailsProfile } from "../../data/userDetailsDisplay";
import {
  IconActivityAccount,
  IconActivityKey,
  IconActivityReset,
  IconUserDetailsBack,
  IconUserDetailsCalendar,
  IconUserDetailsChevronDown,
  IconUserDetailsClock,
  IconUserDetailsDevice,
  IconUserDetailsDocument,
  IconUserDetailsEmail,
  IconUserDetailsKebab,
  IconAssignedLicenseSeal,
  IconUserDetailsPhone,
  IconUserDetailsScan,
  IconUserDetailsUser,
} from "../icons/UserDetailsIcons";
import "../../styles/user-details.css";
import "../../styles/portal-modal.css";

type Props = {
  profile: UserDetailsProfile;
  backHref: string;
  activityLogsHref?: string;
  onEdit?: () => void;
  onToggleStatus?: () => void;
};

function activityIcon(icon: UserActivityEntry["icon"]) {
  if (icon === "key") return <IconActivityKey />;
  if (icon === "account") return <IconActivityAccount />;
  return <IconActivityReset />;
}

function splitActivationDate(value: string) {
  const commaIndex = value.indexOf(", ");
  if (commaIndex === -1) return { line1: value, line2: "" };
  return {
    line1: `${value.slice(0, commaIndex + 1)}`,
    line2: value.slice(commaIndex + 2),
  };
}

export default function UserDetailsBody({
  profile,
  backHref,
  activityLogsHref = "#",
  onEdit,
  onToggleStatus,
}: Props) {
  const metrics = [
    { label: "Last Login", value: profile.lastLogin, icon: <IconUserDetailsClock /> },
    { label: "Total Scans", value: profile.totalScans, icon: <IconUserDetailsScan /> },
    { label: "Documents", value: profile.documents, icon: <IconUserDetailsDocument /> },
    { label: "Device", value: profile.device, icon: <IconUserDetailsDevice /> },
  ];
  const activationDate = splitActivationDate(profile.licenseActivation);
  const keyIsActive = profile.licenseKeyStatus.toLowerCase() === "active";

  return (
    <div className="admin-shell__content">
      <div className="user-details-header">
        <h2 className="user-details-header__title">User Details</h2>
        <div className="user-details-header__actions">
          <Link to={backHref} className="user-details-back">
            <IconUserDetailsBack />
            Back to Users
          </Link>
          <button type="button" className="figma-btn figma-btn--outline-green" onClick={onEdit}>
            Edit User
          </button>
          {profile.isActive ? (
            <button
              type="button"
              className="figma-btn user-details-btn--deactivate"
              onClick={onToggleStatus}
            >
              Deactivate User
            </button>
          ) : null}
        </div>
      </div>

      <div className="user-details-layout">
        <div>
          <div className="user-details-profile-card">
            <div className="user-details-profile-card__avatar" aria-hidden="true">
              {profile.initials}
            </div>
            <h3 className="user-details-profile-card__name">{profile.fullName}</h3>
            <span
              className={`user-details-profile-card__badge${profile.isActive ? "" : " user-details-profile-card__badge--inactive"}`}
            >
              {profile.statusLabel}
            </span>

            <div className="user-details-info-row">
              <span className="user-details-info-row__icon">
                <IconUserDetailsUser />
              </span>
              <span>
                <span className="user-details-info-row__label">Username</span>
                <span className="user-details-info-row__value">{profile.username}</span>
              </span>
            </div>
            <div className="user-details-info-row">
              <span className="user-details-info-row__icon">
                <IconUserDetailsEmail />
              </span>
              <span>
                <span className="user-details-info-row__label">Email Address</span>
                <span className="user-details-info-row__value">{profile.email}</span>
              </span>
            </div>
            <div className="user-details-info-row">
              <span className="user-details-info-row__icon">
                <IconUserDetailsPhone />
              </span>
              <span>
                <span className="user-details-info-row__label">Phone Number</span>
                <span className="user-details-info-row__value">{profile.phoneNumber}</span>
              </span>
            </div>
            <div className="user-details-info-row">
              <span className="user-details-info-row__icon">
                <IconUserDetailsCalendar />
              </span>
              <span>
                <span className="user-details-info-row__label">Registration Date</span>
                <span className="user-details-info-row__value">{profile.registeredAt}</span>
              </span>
            </div>
          </div>

          <div className="user-details-license-card">
            <div className="user-details-license-card__header">
              <h4 className="user-details-license-card__title">Assigned Serial</h4>
              <IconAssignedLicenseSeal className="user-details-license-card__seal" />
            </div>

            <div className="user-details-license-card__key-box">
              <span className="user-details-license-card__key-label">Serial Key</span>
              <span className="user-details-license-card__key-value">{profile.serialKey}</span>
            </div>

            <div className="user-details-license-card__meta">
              <div className="user-details-license-card__meta-item">
                <span className="user-details-license-card__meta-label">Key Status</span>
                <span
                  className={`user-details-license-card__meta-value user-details-license-card__meta-value--status${keyIsActive ? "" : " user-details-license-card__meta-value--inactive"}`}
                >
                  <span
                    className={`user-details-license-card__status-dot${keyIsActive ? "" : " user-details-license-card__status-dot--inactive"}`}
                    aria-hidden="true"
                  />
                  {profile.licenseKeyStatus}
                </span>
              </div>
              <div className="user-details-license-card__meta-item">
                <span className="user-details-license-card__meta-label">Activation</span>
                <span className="user-details-license-card__meta-value user-details-license-card__meta-value--date">
                  <span>{activationDate.line1}</span>
                  {activationDate.line2 ? <span>{activationDate.line2}</span> : null}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="user-details-main">
          <div className="user-details-metrics">
            {metrics.map((metric) => (
              <div key={metric.label} className="user-details-metric">
                <span className="user-details-metric__icon">{metric.icon}</span>
                <span>
                  <span className="user-details-metric__label">{metric.label}</span>
                  <span className="user-details-metric__value">{metric.value}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="user-details-activity-card">
            <div className="user-details-activity-card__header">
              <h4 className="user-details-activity-card__title">Recent Activity Log</h4>
              <Link to={activityLogsHref} className="user-details-activity-card__link">
                View All Logs
              </Link>
            </div>
            <table className="user-details-activity-table">
              <thead>
                <tr>
                  <th>Date &amp; Time</th>
                  <th>Activity Description</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {profile.activities.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <span className="user-details-activity-datetime">{entry.date}</span>
                      <span className="user-details-activity-time">{entry.time}</span>
                    </td>
                    <td>
                      <span className="user-details-activity-desc">
                        <span className="user-details-activity-desc__icon">{activityIcon(entry.icon)}</span>
                        {entry.description}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`user-details-pill user-details-pill--${entry.status === "success" ? "success" : "pending"}`}
                      >
                        {entry.status === "success" ? "Success" : "Pending"}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="user-details-activity-menu" aria-label="Activity actions">
                        <IconUserDetailsKebab />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="user-details-activity-footer">
              <button type="button" className="user-details-load-more">
                Load More History
                <IconUserDetailsChevronDown />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
