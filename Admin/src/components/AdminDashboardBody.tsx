import { useEffect, useMemo, useState } from "react";
import { isDeviceOnline } from "../lib/statusDisplay";
import { Link } from "react-router-dom";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import AnimatedPanel from "./AnimatedPanel";
import {
  IconActiveDevices,
  IconAssignedKeys,
  IconAvailableKeys,
  IconTotalUsers,
} from "./icons/AdminIcons";
import DashboardNotificationIcon from "./icons/DashboardNotificationIcon";
import { devicesApi } from "../api/devices.api";
import { activityLogsApi } from "../api/activityLogs.api";
import { keysApi } from "../api/keys.api";
import { usersApi } from "../api/users.api";
import {
  DASHBOARD_ACTIVITY_ROW_COUNT,
  DASHBOARD_NOTIFICATIONS,
  type DashboardActivityRow,
  type DashboardNotification,
} from "../data/demoDashboard";
import { mapActivityLogsToDashboardRows } from "../lib/activityDisplay";
import { useDashboardRefreshStore } from "../store/dashboardRefreshStore";
import { brandColors } from "../theme/brand";
import "../styles/page-transition.css";

const DONUT_COLORS = {
  active: brandColors.rainForest,
  inactive: brandColors.warning,
  attention: brandColors.danger,
};

type DashboardStats = {
  totalUsers: number;
  activeDevices: number;
  assignedKeys: number;
  availableKeys: number;
  deviceActive: number;
  deviceInactive: number;
  deviceAttention: number;
  keyUtilizationPct: number;
  keysUsed: number;
  keysTotal: number;
};

type RouteMap = {
  users: string;
  keys: string;
  devices: string;
  help: string;
  activityLogs: string;
  notificationsCenter: string;
  registerUser: string;
  generateKeys: string;
  viewDevices: string;
  provideAssistance: string;
  investigateSecurity: string;
};

const DEFAULT_ROUTES: RouteMap = {
  users: "/portal/users",
  keys: "/portal/keys",
  devices: "/portal/devices",
  help: "/portal/help",
  activityLogs: "/portal/activity-logs",
  notificationsCenter: "/portal/notifications",
  registerUser: "/portal/dashboard",
  generateKeys: "/portal/dashboard",
  viewDevices: "/portal/dashboard",
  provideAssistance: "/portal/dashboard",
  investigateSecurity: "/portal/dashboard",
};

const FIGMA_ROUTES: RouteMap = {
  users: "/user-management-2226-1953",
  keys: "/license-key-management-2226-2536",
  devices: "/device-management",
  help: "/help-and-support-center-2226-2276",
  activityLogs: "/admin-dashboard-activity-logs",
  notificationsCenter: "/admin-dashboard-notifications-center",
  registerUser: "/admin-dashboard-user-register-modal",
  generateKeys: "/admin-dashboard-generate-keys",
  viewDevices: "/admin-dashboard-view-devices",
  provideAssistance: "/admin-dashboard-provide-assistance",
  investigateSecurity: "/admin-dashboard-investigate-security",
};

const EMPTY_DASHBOARD_STATS: DashboardStats = {
  totalUsers: 0,
  activeDevices: 0,
  assignedKeys: 0,
  availableKeys: 0,
  deviceActive: 0,
  deviceInactive: 0,
  deviceAttention: 0,
  keyUtilizationPct: 0,
  keysUsed: 0,
  keysTotal: 0,
};

type Props = {
  variant?: "portal" | "figma";
  onRegisterUser?: () => void;
  onGenerateKeys?: () => void;
  onViewDevices?: () => void;
  onProvideAssistance?: () => void;
  onInvestigateSecurity?: () => void;
};

export default function AdminDashboardBody({
  variant = "portal",
}: Props) {
  const routes = variant === "figma" ? FIGMA_ROUTES : DEFAULT_ROUTES;
  const [stats, setStats] = useState<DashboardStats>(EMPTY_DASHBOARD_STATS);
  const [activityRows, setActivityRows] = useState<DashboardActivityRow[]>([]);
  const [notifications, setNotifications] = useState(DASHBOARD_NOTIFICATIONS);
  const refreshToken = useDashboardRefreshStore((s) => s.token);
  const [contentRefreshing, setContentRefreshing] = useState(false);

  useEffect(() => {
    setContentRefreshing(true);
    const timer = window.setTimeout(() => setContentRefreshing(false), 220);
    return () => window.clearTimeout(timer);
  }, [refreshToken]);

  useEffect(() => {
    if (variant === "figma") return;

    async function load() {
      try {
        const [users, keys, devices, logs] = await Promise.all([
          usersApi.list(),
          keysApi.list(),
          devicesApi.list(),
          activityLogsApi.list().catch(() => []),
        ]);

        const totalUsers = users.length;
        const deviceActive = devices.filter((d) => isDeviceOnline(d)).length;
        const deviceInactive = devices.length - deviceActive;
        const deviceAttention = 0;
        const assignedKeys = keys.length;
        const keysTotal = Math.max(totalUsers, assignedKeys);
        const availableKeys = Math.max(0, keysTotal - assignedKeys);
        const keysUsed = Math.min(assignedKeys, keysTotal);
        const keyUtilizationPct = keysTotal > 0 ? Math.round((keysUsed / keysTotal) * 100) : 0;

        setStats({
          totalUsers,
          activeDevices: deviceActive,
          assignedKeys,
          availableKeys,
          deviceActive,
          deviceInactive,
          deviceAttention,
          keyUtilizationPct,
          keysUsed,
          keysTotal,
        });

        const recentActivity = mapActivityLogsToDashboardRows(
          logs,
          Math.max(DASHBOARD_ACTIVITY_ROW_COUNT, 5),
        );
        setActivityRows(recentActivity);
        setNotifications(
          recentActivity.slice(0, 3).map((row, index) => ({
            id: row.id || String(index),
            title: row.action,
            subtitle: `${row.name}${row.email ? ` · ${row.email}` : ""}`,
            iconTone: index === 0 ? "blue" : index === 1 ? "green" : "gray",
          })) as DashboardNotification[],
        );
      } catch {
        setStats(EMPTY_DASHBOARD_STATS);
        setActivityRows([]);
      }
    }
    load();
  }, [variant, refreshToken]);

  const donutData = useMemo(
    () => [
      { name: "Active", value: stats.deviceActive, color: DONUT_COLORS.active },
      { name: "Inactive", value: stats.deviceInactive, color: DONUT_COLORS.inactive },
      {
        name: "Devices Requiring Attention",
        value: stats.deviceAttention,
        color: DONUT_COLORS.attention,
      },
    ],
    [stats],
  );

  const deviceTotal = stats.deviceActive + stats.deviceInactive + stats.deviceAttention;

  return (
    <AnimatedPanel
      transitionKey={`dashboard-${refreshToken}`}
      className={`page-transition--route${contentRefreshing ? " page-transition--loading" : ""}`}
    >
      <div className="admin-shell__content">
        <div className="dash-stats">
          <div className="dash-stat">
            <span className="dash-stat__icon dash-stat__icon--users" aria-hidden="true">
              <IconTotalUsers />
            </span>
            <div className="dash-stat__content">
              <span className="dash-stat__label">TOTAL USERS</span>
              <div className="dash-stat__value">{stats.totalUsers.toLocaleString()}</div>
              <div className="dash-stat__hint">All registered users</div>
            </div>
          </div>

          <div className="dash-stat">
            <span className="dash-stat__icon dash-stat__icon--devices" aria-hidden="true">
              <IconActiveDevices />
            </span>
            <div className="dash-stat__content">
              <span className="dash-stat__label">ACTIVE DEVICES</span>
              <div className="dash-stat__value">{stats.activeDevices.toLocaleString()}</div>
              <div className="dash-stat__hint">Currently active</div>
            </div>
          </div>

          <div className="dash-stat">
            <span className="dash-stat__icon dash-stat__icon--keys" aria-hidden="true">
              <IconAssignedKeys />
            </span>
            <div className="dash-stat__content">
              <span className="dash-stat__label">ASSIGNED KEYS</span>
              <div className="dash-stat__value">{stats.assignedKeys.toLocaleString()}</div>
              <div className="dash-stat__hint">Issued to users</div>
            </div>
          </div>

          <div className="dash-stat">
            <span className="dash-stat__icon dash-stat__icon--available" aria-hidden="true">
              <IconAvailableKeys />
            </span>
            <div className="dash-stat__content">
              <span className="dash-stat__label">AVAILABLE KEYS</span>
              <div className="dash-stat__value">{stats.availableKeys.toLocaleString()}</div>
              <div className="dash-stat__hint">Remaining allocation</div>
            </div>
          </div>
        </div>

        <div className="dash-main">
          <div className="dash-main__activity">
            <div className="dash-card dash-card--activity">
              <div className="dash-card__title-row">
                <h2 className="dash-card__title">Recent Activity</h2>
                <Link to={routes.activityLogs} className="dash-card__link">
                  View All Logs
                </Link>
              </div>
              <div className="dash-activity-table-wrap">
                <table className="dash-activity-table">
                  <colgroup>
                    <col className="dash-activity-table__col-user" />
                    <col className="dash-activity-table__col-action" />
                    <col className="dash-activity-table__col-time" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>USER</th>
                      <th>ACTION</th>
                      <th>TIMESTAMP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityRows.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="dash-activity-table__empty">
                          No recent activity yet.
                        </td>
                      </tr>
                    ) : (
                      activityRows.map((row) => (
                        <tr key={row.id}>
                          <td>
                            <div className="dash-activity-table__user">
                              <img src={row.avatar} alt="" className="dash-activity-table__avatar" />
                              <div className="dash-activity-table__user-text">
                                <span className="dash-activity-table__name">{row.name}</span>
                                <span className="dash-activity-table__email">{row.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="dash-activity-table__action">{row.action}</td>
                          <td className="dash-activity-table__time">{row.timestamp}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="dash-main__notifications">
            <div className="dash-card dash-card--notifications">
              <div className="dash-card__title-row">
                <h2 className="dash-card__title">Notifications</h2>
                <button
                  type="button"
                  className="dash-notifications__clear"
                  onClick={() => setNotifications([])}
                >
                  Clear all
                </button>
              </div>
              <div className="dash-notifications">
                {notifications.map((item) => (
                  <div key={item.id} className={`dash-notification dash-notification--${item.iconTone}`}>
                    <span
                      className={`dash-notification__icon dash-notification__icon--${item.iconTone}`}
                      aria-hidden="true"
                    >
                      <DashboardNotificationIcon tone={item.iconTone} />
                    </span>
                    <div className="dash-notification__text">
                      <span className="dash-notification__title">{item.title}</span>
                      <span className="dash-notification__subtitle">{item.subtitle}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Link to={routes.notificationsCenter} className="dash-notifications__footer">
                VIEW ALL NOTIFICATIONS
              </Link>
            </div>
          </div>
        </div>

        <div className="dash-device-overview">
          <div className="dash-card dash-card--overview">
            <div className="dash-card__header">
              <h2 className="dash-card__title">Device Status Overview</h2>
            </div>
            <div className="dash-overview">
              <div className="dash-overview__status">
                <div className="dash-overview__donut">
                  <div className="dash-donut-wrap">
                    <ResponsiveContainer width="100%" height={140}>
                      <PieChart>
                        <Pie
                          data={donutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={44}
                          outerRadius={64}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {donutData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="dash-donut-center">
                      <span className="dash-donut-center__value">{deviceTotal.toLocaleString()}</span>
                      <span className="dash-donut-center__label">TOTAL</span>
                    </div>
                  </div>
                </div>

                <div className="dash-legend-block">
                  <h3 className="dash-legend__title">Device Status Distribution</h3>
                  <div className="dash-legend">
                    {donutData.map((item) => (
                      <div key={item.name} className="dash-legend__item">
                        <span className="dash-legend__dot" style={{ background: item.color }} />
                        <span className="dash-legend__text">
                          {item.name} ({item.value.toLocaleString()})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="dash-license">
                <div className="dash-license__label">Key Utilization</div>
                <div className="dash-license__header">
                  <span className="dash-license__pct">{stats.keyUtilizationPct}%</span>
                  <span className="dash-license__ratio">
                    {stats.keysUsed.toLocaleString()} / {stats.keysTotal.toLocaleString()}
                  </span>
                </div>
                <div className="dash-progress dash-progress--thick">
                  <div className="dash-progress__fill" style={{ width: `${stats.keyUtilizationPct}%` }} />
                </div>
                <p className="dash-license__note">Capacity alert scheduled for 90% threshold.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPanel>
  );
}
