import { Settings } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext";
import { dashboardSaveModeLabel } from "../../lib/dashboardStats";
import { resolveSettings } from "../../lib/settingsStorage";

function shortenPath(path: string): string {
  const normalized = path
    .replace(/^C:\\Scanned Documents\\/i, "Documents\\")
    .replace(/^C:\\Users\\[^\\]+\\Documents\\/i, "Documents\\");
  if (normalized.length <= 32) return normalized;
  return `…${normalized.slice(-31)}`;
}

export function ScanSettingsCard() {
  const navigate = useNavigate();
  const { session } = useSession();
  const settings = useMemo(() => resolveSettings(session.userId), [session.userId]);

  const rows = [
    { label: "Source", value: settings.scanSource },
    { label: "Color Mode", value: settings.scanColorMode },
    { label: "Resolution", value: settings.scanResolution },
    { label: "File Format", value: settings.defaultFileType },
    { label: "Save Mode", value: dashboardSaveModeLabel(settings.saveMode) },
    { label: "Default Location", value: shortenPath(settings.primaryFolder) },
  ];

  return (
    <section className="dash-settings">
      <h2 className="dash-settings__title">Default Scan Settings</h2>
      <dl className="dash-settings__list">
        {rows.map((item) => (
          <div key={item.label} className="dash-settings__row">
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
      <button
        type="button"
        className="dash-settings__btn"
        onClick={() => navigate("/settings", { state: { tab: "scan-defaults" } })}
      >
        <Settings className="h-4 w-4" strokeWidth={1.8} />
        Edit Settings
      </button>
    </section>
  );
}
