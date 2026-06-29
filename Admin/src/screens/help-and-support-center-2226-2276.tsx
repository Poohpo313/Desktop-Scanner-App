import { useState } from "react";
import AdminPortalPage from "../components/portal/AdminPortalPage";
import HelpSupportScreenBody from "../components/portal/HelpSupportScreenBody";
import ModernDatePicker, { EMPTY_DATE_RANGE } from "../components/ModernDatePicker";
import "../styles/help-support-screen.css";

const FIGMA_ID = "2226:2276";

export function HelpAndSupportCenter22262276Screen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ ...EMPTY_DATE_RANGE });

  return (
    <AdminPortalPage
      figmaId={FIGMA_ID}
      screen="help-and-support-center-2226-2276"
      breadcrumb={[{ label: "Devices", to: "/device-management" }, { label: "Help" }]}
      showHeaderUtilities={false}
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
    >
      <HelpSupportScreenBody searchQuery={searchQuery} dateRange={dateRange} />
    </AdminPortalPage>
  );
}

export default HelpAndSupportCenter22262276Screen;
