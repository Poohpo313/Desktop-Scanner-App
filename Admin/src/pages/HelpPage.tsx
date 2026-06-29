import { useCallback, useEffect, useMemo, useState } from "react";
import TopBar from "../components/TopBar";
import ScreenRefreshFrame from "../components/ScreenRefreshFrame";
import HelpSupportScreenBody from "../components/portal/HelpSupportScreenBody";
import ModernDatePicker, { EMPTY_DATE_RANGE } from "../components/ModernDatePicker";
import { userConcernsApi } from "../api/userConcerns.api";
import { useNotificationStore } from "../store/notificationStore";
import { useTopBarRefresh } from "../hooks/useTopBarRefresh";
import { buildHelpStats, mapUserConcernsToHelpReports } from "../lib/adminPortalMappers";
import { PORTAL } from "../routes/portalPaths";
import "../styles/help-support-screen.css";
import "../styles/help-support-troubleshooting-concern-modal.css";
import "../styles/help-support-reply-sent-modal.css";
import "../styles/page-transition.css";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ ...EMPTY_DATE_RANGE });
  const [helpRows, setHelpRows] = useState(() => mapUserConcernsToHelpReports([]));
  const push = useNotificationStore((s) => s.push);

  const load = useCallback(async () => {
    try {
      const concerns = await userConcernsApi.list();
      setHelpRows(mapUserConcernsToHelpReports(concerns));
    } catch {
      push("Failed to load user concerns", "error");
    }
  }, [push]);

  useEffect(() => {
    void load();
  }, [load]);

  const { onRefresh, refreshing, refreshToken } = useTopBarRefresh(load, "Help center refreshed");

  const helpStats = useMemo(() => buildHelpStats(helpRows), [helpRows]);

  return (
    <>
      <TopBar
        breadcrumb={[{ label: "Devices", to: PORTAL.devices }, { label: "Help" }]}
        onRefresh={onRefresh}
        refreshing={refreshing}
        showUtilities={false}
        headerActions={
          <div className="help-support-screen__header-bar">
            <label className="help-support-screen__header-search">
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search reports or issues..."
                aria-label="Search reports or issues"
              />
            </label>
            <ModernDatePicker
              value={dateRange}
              onChange={setDateRange}
              ariaLabel="Filter by date"
              className="help-support-screen__header-date"
            />
          </div>
        }
      />
      <ScreenRefreshFrame refreshToken={refreshToken}>
        <HelpSupportScreenBody
          searchQuery={searchQuery}
          dateRange={dateRange}
          rows={helpRows}
          stats={helpStats}
        />
      </ScreenRefreshFrame>
    </>
  );
}
