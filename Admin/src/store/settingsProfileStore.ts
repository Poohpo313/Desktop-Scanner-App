import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ADMINISTRATOR_OFFICER_ROLE,
  DEMO_SETTINGS_PROFILE,
  getDefaultSettingsFormValues,
  isNewPasswordValid,
  type SettingsFormValues,
} from "../data/demoSettingsProfile";
import {
  DEFAULT_ADMIN_PASSWORD,
  isLegacySuperadminPinValue,
  loadAdminKnownPassword,
  markAdminPasswordChanged,
  saveAdminKnownPassword,
} from "../lib/knownPassword";

function normalizeSidebarUsername(formUsername: string | undefined): string {
  const candidate = formUsername?.trim() || "";
  if (candidate && !candidate.includes("@")) {
    return candidate;
  }

  return DEMO_SETTINGS_PROFILE.username;
}

function rollPasswordChange(values: SettingsFormValues): SettingsFormValues {
  if (!values.newPassword.trim() || !isNewPasswordValid(values.newPassword)) {
    return { ...values };
  }

  return {
    ...values,
    currentPassword: values.newPassword,
    newPassword: "",
  };
}

type SettingsProfileState = {
  formValues: SettingsFormValues;
  headerName: string;
  headerRole: string;
  sidebarName: string;
  sidebarUsername: string;
  avatarUrl: string | null;
  passwordChanged: boolean;
  setAvatarUrl: (url: string | null) => void;
  markPasswordChanged: () => void;
  hydrateFromApi: (profile: {
    username: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    company?: string | null;
    department?: string | null;
  }) => void;
  saveProfile: (values: SettingsFormValues) => SettingsFormValues;
  resetProfile: () => void;
};

function resolveKnownPassword(values: SettingsFormValues, passwordChanged: boolean) {
  const stored = values.currentPassword.trim();
  if (stored && !isLegacySuperadminPinValue(stored)) return stored;
  const known = loadAdminKnownPassword();
  if (known) return known;
  if (passwordChanged) return stored;
  return DEFAULT_ADMIN_PASSWORD;
}

const defaultValues = getDefaultSettingsFormValues();

export const useSettingsProfileStore = create<SettingsProfileState>()(
  persist(
    (set, get) => ({
      formValues: defaultValues,
      headerName: DEMO_SETTINGS_PROFILE.headerName,
      headerRole: ADMINISTRATOR_OFFICER_ROLE,
      sidebarName: ADMINISTRATOR_OFFICER_ROLE,
      sidebarUsername: DEMO_SETTINGS_PROFILE.username,
      avatarUrl: DEMO_SETTINGS_PROFILE.avatarUrl,
      passwordChanged: false,
      setAvatarUrl: (url) => set({ avatarUrl: url }),
      markPasswordChanged: () =>
        set((state) => {
          const rolled = rollPasswordChange(state.formValues);
          const knownPassword = rolled.currentPassword || state.formValues.currentPassword || DEFAULT_ADMIN_PASSWORD;
          return {
            passwordChanged: true,
            formValues: {
              ...state.formValues,
              ...rolled,
              currentPassword: knownPassword,
              newPassword: "",
            },
          };
        }),
      hydrateFromApi: (profile) => {
        const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
        const passwordChanged = get().passwordChanged;
        const knownPassword = resolveKnownPassword(get().formValues, passwordChanged);
        const nextValues: SettingsFormValues = {
          ...defaultValues,
          fullName: fullName || profile.username,
          email: profile.email ?? "",
          phone: profile.phoneNumber ?? "",
          username: profile.username,
          organization: profile.company ?? "",
          department: profile.department ?? "",
          currentPassword: knownPassword,
          newPassword: "",
        };

        set({
          formValues: nextValues,
          headerName: fullName || profile.username,
          headerRole: ADMINISTRATOR_OFFICER_ROLE,
          sidebarName: ADMINISTRATOR_OFFICER_ROLE,
          sidebarUsername: profile.username,
        });
      },
      saveProfile: (values) => {
        const rolled = rollPasswordChange(values);
        const didChangePassword = Boolean(values.newPassword.trim());
        const passwordChanged = get().passwordChanged || didChangePassword;
        const knownPassword = didChangePassword
          ? rolled.currentPassword
          : resolveKnownPassword(values, passwordChanged);

        if (didChangePassword) {
          saveAdminKnownPassword(knownPassword);
          markAdminPasswordChanged();
        }

        const nextValues: SettingsFormValues = {
          ...rolled,
          newPassword: "",
          currentPassword: knownPassword,
        };

        set({
          formValues: nextValues,
          passwordChanged,
          headerName: nextValues.fullName,
          headerRole: ADMINISTRATOR_OFFICER_ROLE,
          sidebarName: ADMINISTRATOR_OFFICER_ROLE,
          sidebarUsername: nextValues.username,
        });

        return nextValues;
      },
      resetProfile: () => {
        set({
          formValues: defaultValues,
          headerName: DEMO_SETTINGS_PROFILE.headerName,
          headerRole: ADMINISTRATOR_OFFICER_ROLE,
          sidebarName: ADMINISTRATOR_OFFICER_ROLE,
          sidebarUsername: DEMO_SETTINGS_PROFILE.username,
          avatarUrl: DEMO_SETTINGS_PROFILE.avatarUrl,
          passwordChanged: false,
        });
      },
    }),
    {
      name: "admin-settings-profile",
      version: 6,
      migrate: (persistedState, version) => {
        const state = persistedState as Partial<SettingsProfileState> & { sidebarEmail?: string };
        const formUsername = state.formValues?.username;

        if (state.sidebarEmail && !state.sidebarUsername) {
          state.sidebarUsername = state.sidebarEmail;
        }
        delete state.sidebarEmail;

        state.sidebarName = ADMINISTRATOR_OFFICER_ROLE;
        state.headerRole = ADMINISTRATOR_OFFICER_ROLE;
        state.sidebarUsername = normalizeSidebarUsername(formUsername);

        if (version < 4) {
          state.sidebarName = ADMINISTRATOR_OFFICER_ROLE;
          state.headerRole = ADMINISTRATOR_OFFICER_ROLE;
        }

        if (version < 5 && state.formValues) {
          if (!state.formValues.currentPassword?.trim()) {
            state.formValues.currentPassword = state.passwordChanged
              ? state.formValues.currentPassword
              : DEFAULT_ADMIN_PASSWORD;
          }
        }

        if (version < 6 && state.formValues) {
          const current = state.formValues.currentPassword?.trim() ?? "";
          if (!state.passwordChanged && isLegacySuperadminPinValue(current)) {
            state.formValues.currentPassword = DEFAULT_ADMIN_PASSWORD;
          }
        }

        return state as SettingsProfileState;
      },
    }
  )
);
