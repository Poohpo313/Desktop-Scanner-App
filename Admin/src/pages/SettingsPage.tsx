import { useCallback } from "react";
import TopBar from "../components/TopBar";
import ScreenRefreshFrame from "../components/ScreenRefreshFrame";
import SettingsScreenBody from "../components/portal/SettingsScreenBody";
import { authApi } from "../api/auth.api";
import { useNotificationStore } from "../store/notificationStore";
import { useTopBarRefresh } from "../hooks/useTopBarRefresh";
import { useAdminScope } from "../hooks/useAdminScope";
import { useSettingsProfileStore } from "../store/settingsProfileStore";
import type { SettingsFormValues } from "../data/demoSettingsProfile";
import { extractApiError } from "../lib/extractApiError";
import { PORTAL } from "../routes/portalPaths";
import "../styles/settings-figma-screen.css";
import "../styles/settings-profile-photo-preview.css";
import "../styles/page-transition.css";

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: "", lastName: "" };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export default function SettingsPage() {
  const push = useNotificationStore((s) => s.push);
  const { scope, reloadScope } = useAdminScope();
  const hydrateFromApi = useSettingsProfileStore((state) => state.hydrateFromApi);

  const refreshSettings = useCallback(async () => {
    try {
      const profile = await authApi.me();
      hydrateFromApi(profile);
      await reloadScope();
    } catch {
      push("Failed to refresh settings", "error");
    }
  }, [hydrateFromApi, push, reloadScope]);

  const { onRefresh, refreshing, refreshToken } = useTopBarRefresh(
    refreshSettings,
    "Settings refreshed",
  );

  const handleSaveProfile = async (values: SettingsFormValues) => {
    try {
      const { firstName, lastName } = splitFullName(values.fullName);

      await authApi.updateProfile({
        firstName,
        lastName,
        email: values.email.trim(),
        phoneNumber: values.phone.trim() || undefined,
      });

      if (values.newPassword.trim()) {
        await authApi.changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
        useSettingsProfileStore.getState().markPasswordChanged();
      }

      const profile = await authApi.me();
      hydrateFromApi(profile);
      await reloadScope();
    } catch (error) {
      throw new Error(extractApiError(error, "Failed to save account settings"));
    }
  };

  return (
    <>
      <TopBar
        breadcrumb={[{ label: "Help", to: PORTAL.help }, { label: "Settings" }]}
        onRefresh={onRefresh}
        refreshing={refreshing}
        showUtilities={false}
      />
      <ScreenRefreshFrame refreshToken={refreshToken}>
        <SettingsScreenBody onSaveProfile={handleSaveProfile} />
      </ScreenRefreshFrame>
    </>
  );
}
