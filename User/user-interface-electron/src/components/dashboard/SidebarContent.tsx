import {
  Cloud,
  FolderOpen,
  HardDrive,
  Info,
  LayoutDashboard,
  MessageCircle,
  ScanLine,
  Search,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { BukolabsBrand } from "../brand/BukolabsBrand";
import { BukolabsLogoMark } from "../brand/BukolabsLogoMark";
import { useAppMode } from "../../context/AppModeContext";
import { allowedNavPaths } from "../../lib/rolePermissions";
import { useSession } from "../../context/SessionContext";
import { OfflineBadge, OfflineNotificationCard } from "../offline";
import { SecurityStatusCard } from "./SecurityStatusCard";
import { UserProfileMenu } from "./UserProfileMenu";

const NAV_LINKS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/scan", label: "Scan", icon: ScanLine },
  { to: "/search", label: "Search", icon: Search },
  { to: "/files", label: "Documents", icon: FolderOpen },
  { to: "/devices", label: "Devices", icon: HardDrive },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/cloud", label: "Cloud", icon: Cloud },
  { to: "/help", label: "About", icon: Info },
  { to: "/help-assistant", label: "Help Assistant", icon: MessageCircle },
];

const OFFLINE_WORKS_PATHS = new Set(["/scan"]);

type SidebarContentProps = {
  compact?: boolean;
  scrollable?: boolean;
  onNavigate?: () => void;
};

function navLinkClass(isActive: boolean, compact: boolean) {
  const base = [
    "group flex items-center gap-3 rounded-xl font-sans text-sm font-medium transition-all duration-200 ease-in-out",
    compact ? "h-11 justify-center px-0" : "h-11 px-4",
  ];

  if (isActive) {
    base.push(
      "bg-[#008768] text-white shadow-[0_4px_12px_rgba(0,135,104,0.30)]",
    );
  } else {
    base.push("text-white/85 hover:bg-white/[0.06]");
    if (!compact) base.push("hover:pl-[18px]");
  }

  return base.join(" ");
}

function isNavItemActive(pathname: string, linkTo: string): boolean {
  if (linkTo === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/offline-dashboard";
  }
  return pathname === linkTo;
}

export function SidebarContent({
  compact = false,
  scrollable = false,
  onNavigate,
}: SidebarContentProps) {
  const { session } = useSession();
  const { isOnline } = useAppMode();
  const { pathname } = useLocation();
  const allowed = new Set(allowedNavPaths(session.role));
  const links = NAV_LINKS.filter((l) => allowed.has(l.to));

  return (
    <div
      className={`flex min-h-full flex-1 flex-col${scrollable ? " app-sidebar__content--scrollable" : " pb-4"}`}
    >
      <div className={compact ? "flex justify-center px-3 pt-5" : "px-6 pt-6"}>
        {compact ? (
          <BukolabsLogoMark className="h-10 w-7 object-contain" />
        ) : (
          <BukolabsBrand variant="sidebar" />
        )}
      </div>

      <nav
        className={`flex shrink-0 flex-col ${compact ? "mt-4 gap-1 px-2" : "mt-8 gap-2 px-4"}`}
        aria-label="Main navigation"
      >
        {links.map((link) => {
          const Icon = link.icon;
          const active = isNavItemActive(pathname, link.to);
          const showOfflineBadge =
            !isOnline && active && !OFFLINE_WORKS_PATHS.has(link.to);

          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onNavigate}
              className={navLinkClass(active, compact)}
              title={compact ? link.label : undefined}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
              {!compact && (
                <span className="flex min-w-0 flex-1 items-center gap-2 truncate">
                  <span className="truncate">{link.label}</span>
                  {showOfflineBadge ? <OfflineBadge /> : null}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div
        className={`flex shrink-0 flex-col gap-2 ${
          compact
            ? "mt-3 items-center px-2"
            : `app-sidebar__footer${scrollable ? " app-sidebar__footer--scrollable" : ""} mt-4 px-4`
        }`}
      >
        {isOnline ? (
          <SecurityStatusCard compact={compact} />
        ) : (
          <OfflineNotificationCard compact={compact} />
        )}
        <UserProfileMenu compact={compact} stacked />
      </div>
    </div>
  );
}
