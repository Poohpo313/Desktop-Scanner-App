import { NavLink, useLocation } from "react-router-dom";
import bukolabsLogo from "../logo/bukolabs-logo 1.png";
import {
  IconDashboard,
  IconDevices,
  IconHelp,
  IconKeys,
  IconSettings,
  IconUserRegistration,
} from "./icons/AdminIcons";
import { ADMINISTRATOR_OFFICER_ROLE, DEMO_SETTINGS_PROFILE } from "../data/demoSettingsProfile";
import { useSettingsProfileStore } from "../store/settingsProfileStore";
import "../styles/admin-console.css";

const SIDEBAR_ADMIN_PROFILE = {
  status: "Online",
} as const;

function getProfileInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function resolveAvatarUrl(storedAvatarUrl: string | null | undefined): string | null {
  return storedAvatarUrl === undefined ? DEMO_SETTINGS_PROFILE.avatarUrl : storedAvatarUrl;
}

type Variant = "portal" | "figma";

const PORTAL_ITEMS = [
  { label: "Dashboard", to: "/portal/dashboard", icon: <IconDashboard /> },
  { label: "User Registration", to: "/portal/users", icon: <IconUserRegistration /> },
  { label: "Keys", to: "/portal/keys", icon: <IconKeys /> },
  { label: "Devices Management", to: "/portal/devices", icon: <IconDevices /> },
  { label: "Help", to: "/portal/help", icon: <IconHelp /> },
  { label: "Settings", to: "/portal/settings", icon: <IconSettings /> },
];

const FIGMA_ITEMS = [
  { label: "Dashboard", to: "/admin-dashboard-2226-1193", icon: <IconDashboard /> },
  { label: "User Registration", to: "/user-management-2226-1953", icon: <IconUserRegistration /> },
  { label: "Keys", to: "/license-key-management-2226-2536", icon: <IconKeys /> },
  { label: "Devices Management", to: "/device-management", icon: <IconDevices /> },
  { label: "Help", to: "/help-and-support-center-2226-2276", icon: <IconHelp /> },
  { label: "Settings", to: "/settings", icon: <IconSettings /> },
];

type Props = {
  variant?: Variant;
};

function isDashboardPath(pathname: string, variant: Variant) {
  if (variant === "figma") {
    return pathname.includes("admin-dashboard");
  }
  return pathname.includes("/portal/dashboard") || pathname.includes("/portal/activity-logs");
}

export default function Sidebar({ variant = "portal" }: Props) {
  const location = useLocation();
  const items = variant === "figma" ? FIGMA_ITEMS : PORTAL_ITEMS;
  const sidebarUsername = useSettingsProfileStore((state) => state.sidebarUsername);
  const formUsername = useSettingsProfileStore((state) => state.formValues.username);
  const profileFullName = useSettingsProfileStore((state) => state.formValues.fullName);
  const storedAvatarUrl = useSettingsProfileStore((state) => state.avatarUrl);
  const profileUsername = sidebarUsername || formUsername || DEMO_SETTINGS_PROFILE.username;
  const avatarUrl = resolveAvatarUrl(storedAvatarUrl);
  const profileInitials = getProfileInitials(profileFullName || ADMINISTRATOR_OFFICER_ROLE);

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <div className="admin-sidebar__brand-row">
          <img className="admin-sidebar__logo" src={bukolabsLogo} alt="Bukolabs" />
          <div className="admin-sidebar__brand-text">
            <span className="admin-sidebar__brand-name">bukolabs.io</span>
            <span className="admin-sidebar__brand-tag">infinite possibilities</span>
          </div>
        </div>
      </div>

      <nav className="admin-sidebar__nav" aria-label="Main navigation">
        {items.map(({ label, to, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => {
              const active =
                label === "Dashboard" ? isDashboardPath(location.pathname, variant) : isActive;
              return `admin-sidebar__link${active ? " admin-sidebar__link--active" : ""}`;
            }}
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar__footer">
        <div className="admin-sidebar__user">
          {avatarUrl ? (
            <img className="admin-sidebar__avatar admin-sidebar__avatar--photo" src={avatarUrl} alt="" />
          ) : (
            <div className="admin-sidebar__avatar" aria-hidden="true">
              {profileInitials}
            </div>
          )}
          <div className="admin-sidebar__user-info">
            <div className="admin-sidebar__user-name">{ADMINISTRATOR_OFFICER_ROLE}</div>
            <div className="admin-sidebar__user-email">{profileUsername}</div>
            <div className="admin-sidebar__user-status">
              <span className="admin-sidebar__user-status-dot" aria-hidden="true" />
              <span className="admin-sidebar__user-status-label">{SIDEBAR_ADMIN_PROFILE.status}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
