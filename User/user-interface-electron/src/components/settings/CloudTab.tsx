import { type ReactNode } from "react";
import { useAppMode } from "../../context/AppModeContext";
import { useGatewayStatus } from "../../context/GatewayStatusContext";
import { cloudSyncStatusLabel, hasCloudAccess } from "../../lib/cloudAccess";
import { SettingsRow, SettingsToggleRow } from "./SettingsRow";
import type { AppSettings } from "./settingsData";

type CloudTabProps = {
  settings: AppSettings;
  onChange: (patch: Partial<AppSettings>) => void;
};

function SettingsCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="settings-card">
      <h2 className="settings-card__title">{title}</h2>
      <div className="settings-card__body">{children}</div>
    </section>
  );
}

export function CloudTab({ settings, onChange }: CloudTabProps) {
  const { isOnline } = useAppMode();
  const { reachable: gatewayReachable } = useGatewayStatus();
  const cloudAvailable = hasCloudAccess(isOnline, gatewayReachable);

  return (
    <div className="settings-page__grid settings-page__grid--general">
      <SettingsCard title="Cloud Sync">
        {cloudAvailable ? (
          <>
            <SettingsToggleRow
              label="Cloud Sync"
              checked={settings.cloudSync}
              onChange={(cloudSync) => onChange({ cloudSync })}
            />
            <SettingsRow label="Cloud folder" value={settings.cloudFolderLabel} />
            <SettingsToggleRow
              label="Sync on startup"
              checked={settings.storageSyncOnStartup}
              onChange={(storageSyncOnStartup) => onChange({ storageSyncOnStartup })}
            />
          </>
        ) : (
          <>
            <SettingsRow
              label="Cloud Sync"
              value={cloudSyncStatusLabel(settings.cloudSync, isOnline, gatewayReachable)}
            />
            <p className="settings-card__hint">
              Connect to your office gateway while online to enable cloud sync. Local scanning and
              storage work without cloud access.
            </p>
          </>
        )}
      </SettingsCard>

      <SettingsCard title="Local Privacy">
        <SettingsRow label="Optional Login" value={settings.optionalLogin} />
        <SettingsRow label="Local-only Mode" value={settings.localOnlyMode} />
        <SettingsToggleRow
          label="Secure cloud sync"
          checked={settings.securitySecureCloudSync}
          disabled={!cloudAvailable}
          onChange={(securitySecureCloudSync) =>
            onChange({
              securitySecureCloudSync,
              cloudSync: cloudAvailable ? securitySecureCloudSync && settings.cloudSync : false,
            })
          }
        />
      </SettingsCard>
    </div>
  );
}
