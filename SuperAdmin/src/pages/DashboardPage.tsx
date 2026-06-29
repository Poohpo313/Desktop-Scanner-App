import { useEffect, useMemo, useState } from "react";
import { activityLogsApi } from "../api/activityLogs.api";
import { cloudApi } from "../api/cloud.api";
import { devicesApi } from "../api/devices.api";
import { keysApi } from "../api/keys.api";
import { reportsApi } from "../api/reports.api";
import { usersApi } from "../api/users.api";
import { isDeviceOnline } from "../lib/statusDisplay";
import ScannerActivityChart, {
  type ScannerActivityPoint,
  type ScannerActivityRange,
} from "../components/ScannerActivityChart";
import { PortalErrorState } from "../components/PortalErrorState";
import StatCard from "../components/StatCard";
import TopBar from "../components/TopBar";
import { useNotificationStore } from "../store/notificationStore";
import "../styles/dashboard.css";

type DashboardStats = {
  users: number;
  devicesActive: number;
  cloudPercent: number;
  keysTotal: number;
};

type RecentActivityItem = {
  id: string;
  user: string;
  action: string;
  status: string;
  timestamp: string;
};

type DashboardNotification = {
  id: string;
  title: string;
  message: string;
  timestamp: string;
};

const formatHourLabel = (hour: number) => {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
};

const zeroActivity = (labels: string[]): ScannerActivityPoint[] =>
  labels.map((label) => ({ label, activations: 0, registrations: 0 }));

const createTodayActivityData = (): ScannerActivityPoint[] =>
  Array.from({ length: 6 }, (_, index) => {
    const hour = 8 + index * 2;
    return {
      label: formatHourLabel(hour),
      activations: 0,
      registrations: 0,
    };
  });

const createThisMonthActivityData = (): ScannerActivityPoint[] => {
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  return zeroActivity(Array.from({ length: daysInMonth }, (_, index) => String(index + 1)));
};

const formatActivityTimestamp = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const formatActivityAction = (action: string) =>
  action
    .split(/[._]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const formatActivityStatus = (action: string) => {
  const normalized = action.toLowerCase();
  if (normalized.includes("revok") || normalized.includes("inactive") || normalized.includes("delete")) {
    return "Warning";
  }
  if (normalized.includes("fail") || normalized.includes("error")) {
    return "Failed";
  }
  return "Success";
};

const buildNotificationFromLog = (log: {
  id: string;
  action: string;
  timestamp: string;
  registeredUser?: string;
  username?: string;
}): DashboardNotification | null => {
  const actor = log.registeredUser ?? log.username ?? "System";
  const timestamp = formatActivityTimestamp(log.timestamp);

  switch (log.action) {
    case "revocation.requested":
      return {
        id: log.id,
        title: "Revocation request submitted",
        message: `${actor} submitted a revocation request for Super Admin review.`,
        timestamp,
      };
    case "revocation.approved":
      return {
        id: log.id,
        title: "Revocation approved",
        message: "A pending revocation request was approved.",
        timestamp,
      };
    case "revocation.denied":
      return {
        id: log.id,
        title: "Revocation denied",
        message: "A pending revocation request was denied by the System Administrator.",
        timestamp,
      };
    case "revocation.cancelled":
      return {
        id: log.id,
        title: "Revocation cancelled",
        message: `${actor} cancelled a pending revocation request.`,
        timestamp,
      };
    case "key.generated":
      return {
        id: log.id,
        title: "New serial key generated",
        message: "A new activation key was generated for user onboarding.",
        timestamp,
      };
    case "key.activated":
    case "user.activated":
      return {
        id: log.id,
        title: "Account activated",
        message: `${actor} completed scanner activation.`,
        timestamp,
      };
    case "user.registered":
      return {
        id: log.id,
        title: "New user registered",
        message: `${actor} registered a new account.`,
        timestamp,
      };
    case "device.registered":
      return {
        id: log.id,
        title: "Device registered",
        message: "A workstation device was registered in the system.",
        timestamp,
      };
    default:
      return null;
  }
};

export default function DashboardPage() {
  const push = useNotificationStore((s) => s.push);
  const [stats, setStats] = useState<DashboardStats>({
    users: 0,
    devicesActive: 0,
    cloudPercent: 0,
    keysTotal: 0,
  });
  const [chartDataByRange, setChartDataByRange] = useState<
    Record<ScannerActivityRange, ScannerActivityPoint[]>
  >({
    today: createTodayActivityData(),
    thisWeek: zeroActivity(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]),
    thisMonth: createThisMonthActivityData(),
    thisYear: zeroActivity([
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ]),
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);

  useEffect(() => {
    async function load() {
      const results = await Promise.allSettled([
        usersApi.list(),
        keysApi.list(),
        devicesApi.list(),
        cloudApi.storage(),
        reportsApi.summary(),
        activityLogsApi.list(),
      ]);

      const [usersResult, keysResult, devicesResult, cloudResult, reportsResult, logsResult] =
        results;

      if (
        usersResult.status === "rejected" &&
        keysResult.status === "rejected" &&
        devicesResult.status === "rejected"
      ) {
        push("Failed to load dashboard data", "error");
        return;
      }

      const users = usersResult.status === "fulfilled" ? usersResult.value : [];
      const keys = keysResult.status === "fulfilled" ? keysResult.value : [];
      const devices = devicesResult.status === "fulfilled" ? devicesResult.value : [];
      const cloud = cloudResult.status === "fulfilled" ? cloudResult.value : { percent: 0 };
      const reportSummary = reportsResult.status === "fulfilled" ? reportsResult.value : null;
      const logs = logsResult.status === "fulfilled" ? logsResult.value : [];

      setStats({
        users: reportSummary?.totalUsers ?? users.length,
        devicesActive: devices.filter((device) => isDeviceOnline(device)).length,
        cloudPercent: cloud.percent ?? 0,
        keysTotal: keys.length,
      });

      if (reportSummary?.scannerActivity) {
        setChartDataByRange(reportSummary.scannerActivity);
      }

      setNotifications(
        logs
          .map((log) => buildNotificationFromLog(log))
          .filter((item): item is DashboardNotification => item != null)
          .slice(0, 6),
      );

      setRecentActivity(
        logs.slice(0, 8).map((log) => ({
          id: log.id,
          user: log.registeredUser ?? log.username ?? "System",
          action: formatActivityAction(log.action),
          status: formatActivityStatus(log.action),
          timestamp: formatActivityTimestamp(log.timestamp),
        })),
      );
    }

    void load();
  }, [push]);

  const hasRecentActivity = recentActivity.length > 0;

  return (
    <>
      <TopBar
        title="Desktop Scanner System Administrator Console"
        sectionLabel="Dashboard"
        subtitle="Overview of system usage, security, device activity, and cloud resources"
        showLogout={false}
        variant="dashboard"
      />
      <main className="dashboard-page">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Users"
            value={stats.users}
            hint="All Registered Users"
            iconSrc="/assets/User.svg"
            iconAlt="Users"
            iconTone="blue"
          />
          <StatCard
            label="Active Devices"
            value={stats.devicesActive}
            hint="Currently online in the app"
            iconSrc="/assets/Devices.svg"
            iconAlt="Devices"
            iconTone="purple"
          />
          <StatCard
            label="Cloud Storage"
            value={`${stats.cloudPercent}%`}
            hint="Storage Utilized"
            iconSrc="/assets/Cloud.svg"
            iconAlt="Cloud storage"
            iconTone="green"
          />
          <StatCard
            label="Generated Keys"
            value={stats.keysTotal}
            hint="Keys Generated"
            iconSrc="/assets/Keys.svg"
            iconAlt="Generated keys"
            iconTone="amber"
          />
        </div>

        <div className="dashboard-secondary">
          <ScannerActivityChart dataByRange={chartDataByRange} />

          <div className="dashboard-side-panels">
            <section className="dashboard-panel dashboard-panel--notifications">
              <div className="dashboard-panel__header">
                <h2 className="dashboard-panel__title">Recent Notifications</h2>
                <button
                  className="dashboard-panel__clear"
                  type="button"
                  onClick={() => setNotifications([])}
                  disabled={notifications.length === 0}
                >
                  Clear all
                </button>
              </div>
              <div className="dashboard-notifications-list">
                {notifications.length === 0 ? (
                  <PortalErrorState
                    variant="empty"
                    title="No Notifications"
                    message="System notifications will appear here as activity occurs."
                    compact
                  />
                ) : (
                  notifications.map((notification) => (
                    <article className="dashboard-notification-item" key={notification.id}>
                      <strong>{notification.title}</strong>
                      <p>{notification.message}</p>
                      <span>{notification.timestamp}</span>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>

        <section className="dashboard-activity-card">
          <div className="dashboard-panel__header">
            <h2 className="dashboard-panel__title">Recent Activity</h2>
            <button className="dashboard-panel__clear" type="button">
              View All Logs
            </button>
          </div>
          <div className="dashboard-activity-table-wrap">
            <table className="dashboard-activity-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {hasRecentActivity ? (
                  recentActivity.map((item) => (
                    <tr key={item.id}>
                      <td>{item.user}</td>
                      <td>{item.action}</td>
                      <td>{item.status}</td>
                      <td>{item.timestamp}</td>
                      <td />
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>No recent activity yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
