import { NavLink } from "react-router-dom";
import { useProfileInitials, useProfileStore } from "../store/profileStore";
import "../styles/sidebar.css";

const items = [
  { label: "Dashboard", to: "/portal/dashboard", iconSrc: "/assets/Grid.svg" },
  { label: "Registration", to: "/portal/admins", iconSrc: "/assets/User.svg" },
  { label: "Keys", to: "/portal/keys", iconSrc: "/assets/Key.svg" },
  { label: "User Device Management", to: "/portal/users", iconSrc: "/assets/Devices.svg" },
  { label: "Logs", to: "/portal/logs", iconSrc: "/assets/File.svg" },
  { label: "Cloud", to: "/portal/cloud", iconSrc: "/assets/Cloud.svg" },
  { label: "Help", to: "/portal/help", iconSrc: "/assets/Help circle.svg" },
  { label: "Settings", to: "/portal/settings", iconSrc: "/assets/Settings.svg" },
];

export default function Sidebar() {
  const fullName = useProfileStore((state) => state.fullName);
  const email = useProfileStore((state) => state.email);
  const initials = useProfileInitials();
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <img
          className="admin-sidebar__logo"
          src="/assets/bukolabs-logo-main.svg"
          alt="Bukolabs"
        />
        <div>
          <p className="admin-sidebar__brand-name">bukolabs.io</p>
          <p className="admin-sidebar__tagline">infinite possibilities</p>
        </div>
      </div>

      <nav className="admin-sidebar__nav" aria-label="Super admin navigation">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `admin-sidebar__link${isActive ? " admin-sidebar__link--active" : ""}`
            }
          >
            <img className="admin-sidebar__link-icon" src={item.iconSrc} alt="" aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar__profile">
        <div className="admin-sidebar__avatar">{initials || "SA"}</div>
        <div className="admin-sidebar__profile-copy">
          <p>{fullName}</p>
          <span>{email || "superadmin"}</span>
          <strong>Online</strong>
        </div>
      </div>
    </aside>
  );
}
