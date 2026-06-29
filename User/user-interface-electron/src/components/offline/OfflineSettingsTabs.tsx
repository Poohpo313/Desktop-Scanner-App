import { useState } from "react";

const TABS = ["General", "Scan Defaults", "Storage", "OCR", "Security"] as const;

export function OfflineSettingsTabs() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("General");

  return (
    <div className="offline-settings-tabs" role="tablist" aria-label="Settings sections">
      {TABS.map((tab) => {
        const active = tab === activeTab;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active}
            className={`settings-page__tab${active ? " settings-page__tab--active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
