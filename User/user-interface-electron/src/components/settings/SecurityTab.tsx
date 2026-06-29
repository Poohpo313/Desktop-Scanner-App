import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { SelectionModal } from "../scan/offline/modals/SelectionModal";
import { SettingsToggleRow } from "./SettingsRow";
import {
  APP_LOCK_OPTIONS,
  REMOVABLE_STORAGE_OPTIONS,
  securityOptionLabel,
} from "./securitySettingsData";
import type { AppSettings } from "./settingsData";

type SecurityTabModal = "app-lock" | "removable-storage" | null;

type SecurityTabProps = {
  settings: AppSettings;
  isOnline: boolean;
  onChange: (patch: Partial<AppSettings>) => void;
};

function SettingsSelectField({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <label className="settings-scan-field">
      <span className="settings-scan-field__label">{label}</span>
      <button type="button" className="settings-scan-field__select" onClick={onClick}>
        <span>{value}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-[#94A3B8]" strokeWidth={1.8} />
      </button>
    </label>
  );
}

export function SecurityTab({ settings, isOnline, onChange }: SecurityTabProps) {
  const [modal, setModal] = useState<SecurityTabModal>(null);

  return (
    <>
      <div className="settings-page__grid settings-page__grid--scan">
        <section className="settings-scan-card">
          <h2 className="settings-scan-card__title">Access Control</h2>
          <div className="settings-scan-card__body">
            <div className="settings-scan-card__toggles settings-scan-card__toggles--standalone">
              <SettingsToggleRow
                label="Optional login"
                checked={settings.securityOptionalLogin}
                onChange={(securityOptionalLogin) =>
                  onChange({
                    securityOptionalLogin,
                    optionalLogin: securityOptionalLogin ? "Enabled" : "Disabled",
                  })
                }
              />
              <SettingsToggleRow
                label="Require admin approval for settings changes"
                checked={settings.securityRequireAdminApproval}
                onChange={(securityRequireAdminApproval) => onChange({ securityRequireAdminApproval })}
              />
            </div>

            <SettingsSelectField
              label="App lock after inactivity"
              value={settings.securityAppLockLabel}
              onClick={() => setModal("app-lock")}
            />
          </div>
        </section>

        <section className="settings-scan-card">
          <h2 className="settings-scan-card__title">Data Protection</h2>
          <div className="settings-scan-card__body">
            <div className="settings-scan-card__toggles settings-scan-card__toggles--standalone">
              <SettingsToggleRow
                label="Local file encryption"
                checked={settings.securityEncryptLocal}
                onChange={(securityEncryptLocal) => onChange({ securityEncryptLocal })}
              />
              <SettingsToggleRow
                label="Secure cloud sync"
                checked={settings.securitySecureCloudSync}
                disabled={!isOnline}
                onChange={(securitySecureCloudSync) =>
                  onChange({
                    securitySecureCloudSync,
                    cloudSync: securitySecureCloudSync,
                  })
                }
              />
            </div>

            <SettingsSelectField
              label="Removable storage restrictions"
              value={settings.securityRemovableStorage}
              onClick={() => setModal("removable-storage")}
            />
          </div>
        </section>
      </div>

      {modal === "app-lock" ? (
        <SelectionModal
          title="App Lock After Inactivity"
          subtitle="Automatically lock the app when there is no activity."
          options={APP_LOCK_OPTIONS}
          value={settings.securityAppLockId}
          showSummary={false}
          onApply={(securityAppLockId) =>
            onChange({
              securityAppLockId,
              securityAppLockLabel: securityOptionLabel(
                APP_LOCK_OPTIONS,
                securityAppLockId,
                settings.securityAppLockLabel,
              ),
            })
          }
          onClose={() => setModal(null)}
        />
      ) : null}

      {modal === "removable-storage" ? (
        <SelectionModal
          title="Removable Storage Restrictions"
          subtitle="Control how USB drives and external storage are handled."
          options={REMOVABLE_STORAGE_OPTIONS}
          value={settings.securityRemovableStorageId}
          showSummary={false}
          onApply={(securityRemovableStorageId) =>
            onChange({
              securityRemovableStorageId,
              securityRemovableStorage: securityOptionLabel(
                REMOVABLE_STORAGE_OPTIONS,
                securityRemovableStorageId,
                settings.securityRemovableStorage,
              ),
            })
          }
          onClose={() => setModal(null)}
        />
      ) : null}
    </>
  );
}
