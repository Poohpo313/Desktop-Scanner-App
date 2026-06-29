import { ConsolePageHeader } from "../layout/ConsolePageHeader";
import { AppStatusBar } from "../layout/AppStatusBar";
import { getConsolePageSubtitle, getConsolePageTitle } from "../layout/consolePageMeta";
import { useSession } from "../../context/SessionContext";
import { resolveSettings } from "../../lib/settingsStorage";
import { ApplicationDetailsCard } from "./ApplicationDetailsCard";
import { SystemInformationCard } from "./SystemInformationCard";
import "../../styles/about.css";

export function AboutPageView() {
  const { session } = useSession();
  const settings = resolveSettings(session.userId);

  return (
    <div className="about-page console-page" data-screen="section-08-about" data-figma-id="38:1565">
      <ConsolePageHeader
        title={getConsolePageTitle("About")}
        subtitle={getConsolePageSubtitle("About")}
      />

      <div className="console-page__body">
        <div className="about-page__grid">
          <ApplicationDetailsCard />
          <SystemInformationCard />
        </div>
      </div>

      <AppStatusBar variant="about-status-bar" localStoragePath={settings.primaryFolder} />
    </div>
  );
}