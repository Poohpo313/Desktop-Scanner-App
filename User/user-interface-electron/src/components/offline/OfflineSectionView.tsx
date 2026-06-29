import { OfflineConsoleHeader } from "./OfflineConsoleHeader";
import { OfflineDashboardHeader } from "./OfflineDashboardHeader";
import { OfflineSettingsTabs } from "./OfflineSettingsTabs";
import { OfflineStateCard } from "./OfflineStateCard";
import { HELP_ASSISTANT_OFFLINE_STATUS, OfflineStatusBar } from "./OfflineStatusBar";
import {
  getOfflineConsoleBreadcrumb,
  getOfflineConsoleTitle,
  OFFLINE_UNAVAILABLE_SUBTITLE,
} from "./offlineConsoleTitles";
import "../../styles/dashboard.css";
import "../../styles/settings-page.css";

type OfflineSectionViewProps = {
  section: string;
  screenSlug?: string;
  showSettingsTabs?: boolean;
};

export function OfflineSectionView({
  section,
  screenSlug,
  showSettingsTabs = false,
}: OfflineSectionViewProps) {
  const breadcrumb = getOfflineConsoleBreadcrumb(section);

  return (
    <div
      className="dashboard dashboard--offline"
      data-screen={screenSlug ?? `section-offline-${section.toLowerCase()}`}
    >
      {section === "Dashboard" ? (
        <OfflineDashboardHeader />
      ) : (
        <OfflineConsoleHeader
          title={getOfflineConsoleTitle(section)}
          breadcrumb={breadcrumb}
          subtitle={breadcrumb ? undefined : OFFLINE_UNAVAILABLE_SUBTITLE}
        />
      )}

      <div className="dashboard--offline__body">
        {showSettingsTabs ? <OfflineSettingsTabs /> : null}

        <div className="offline-section-panel">
          <div className="offline-section-panel__content">
            <OfflineStateCard section={section} />
          </div>
        </div>
      </div>

      <OfflineStatusBar
        lastItem={section === "Help Assistant" ? HELP_ASSISTANT_OFFLINE_STATUS : undefined}
      />
    </div>
  );
}
