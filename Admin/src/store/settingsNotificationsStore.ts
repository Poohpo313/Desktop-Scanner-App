import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getDefaultNotificationPreferences,
  type NotificationPreferences,
} from "../data/demoSettingsNotifications";

type SettingsNotificationsState = {
  preferences: NotificationPreferences;
  savePreferences: (preferences: NotificationPreferences) => NotificationPreferences;
  resetPreferences: () => void;
};

const defaultPreferences = getDefaultNotificationPreferences();

export const useSettingsNotificationsStore = create<SettingsNotificationsState>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,
      savePreferences: (preferences) => {
        set({ preferences });
        return preferences;
      },
      resetPreferences: () => {
        set({ preferences: defaultPreferences });
      },
    }),
    {
      name: "admin-settings-notifications",
    }
  )
);
