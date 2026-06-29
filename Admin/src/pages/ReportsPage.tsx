import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import TopBar from "../components/TopBar";
import ScreenRefreshFrame from "../components/ScreenRefreshFrame";
import { keysApi } from "../api/keys.api";
import { reportsApi } from "../api/reports.api";
import { usersApi } from "../api/users.api";
import { useNotificationStore } from "../store/notificationStore";
import { useTopBarRefresh } from "../hooks/useTopBarRefresh";
import { PORTAL } from "../routes/portalPaths";
import type { ReportSummary } from "../types";
import { brandColors, chartPalette } from "../theme/brand";
import "../styles/portal-pages.css";
import "../styles/page-transition.css";

const COLORS = [...chartPalette];

export default function ReportsPage() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const push = useNotificationStore((s) => s.push);

  const load = useCallback(async () => {
    try {
      const [report, users, keys] = await Promise.all([
        reportsApi.summary(),
        usersApi.list(),
        keysApi.list(),
      ]);
      const active = users.filter((u) => u.accountStatus === "active").length;
      const inactive = users.length - active;
      setSummary({
        ...report,
        keyUsage: [
          { name: "unused", value: keys.filter((k) => k.status === "unused").length },
          { name: "used", value: keys.filter((k) => k.status === "used").length },
          { name: "assigned", value: keys.filter((k) => k.status === "assigned").length },
          { name: "revoked", value: keys.filter((k) => k.status === "revoked").length },
        ],
        userStatus: [
          { name: "active", value: active },
          { name: "inactive", value: inactive },
        ],
      });
    } catch {
      push("Failed to load reports", "error");
      throw new Error("Failed to load reports");
    }
  }, [push]);

  useEffect(() => {
    void load();
  }, [load]);

  const { onRefresh, refreshing, refreshToken } = useTopBarRefresh(load, "Reports refreshed");

  const lineData = useMemo(() => summary?.filesPerDay ?? [], [summary]);
  const pieData = useMemo(() => summary?.keyUsage ?? [], [summary]);
  const barData = useMemo(() => summary?.userStatus ?? [], [summary]);

  const exportCsv = async () => {
    try {
      await reportsApi.export("csv");
      push("Report exported", "success");
    } catch {
      push("Export failed", "error");
    }
  };

  return (
    <>
      <TopBar
        breadcrumb={[{ label: "Home", to: PORTAL.dashboard }, { label: "Reports" }]}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />
      <ScreenRefreshFrame refreshToken={refreshToken}>
        <main className="admin-shell__content">
          <div className="portal-page__toolbar">
            <p className="portal-page__desc">Analytics and exportable reports for your admin console.</p>
            <button type="button" onClick={exportCsv} className="figma-btn figma-btn--primary">
              Export Report as CSV
            </button>
          </div>

          <div className="portal-table-card" style={{ marginBottom: 20 }}>
            <div className="portal-table-card__header">
              <span className="portal-table-card__title">Files per Day</span>
            </div>
            <div style={{ padding: "16px 20px 24px", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke={brandColors.persianGreen} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="portal-page-grid">
            <div className="portal-table-card">
              <div className="portal-table-card__header">
                <span className="portal-table-card__title">Key Usage Summary</span>
              </div>
              <div style={{ padding: "16px 20px 24px", height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="portal-table-card">
              <div className="portal-table-card__header">
                <span className="portal-table-card__title">Active vs Inactive Users</span>
              </div>
              <div style={{ padding: "16px 20px 24px", height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill={brandColors.rainForest} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </main>
      </ScreenRefreshFrame>
    </>
  );
}
