import { useCallback, useMemo, useState } from "react";
import { z } from "zod";
import TopBar from "../components/TopBar";
import ScreenRefreshFrame from "../components/ScreenRefreshFrame";
import AdminDashboardBody from "../components/AdminDashboardBody";
import PortalOverlay from "../components/portal/PortalOverlay";
import RegisterUserModal, { type RegisterUserFormData } from "../components/portal/RegisterUserModal";
import GenerateLicenseKeysModal from "../components/portal/GenerateLicenseKeysModal";
import ViewDevicesModal from "../components/portal/ViewDevicesModal";
import ProvideAssistanceModal from "../components/portal/ProvideAssistanceModal";
import SecurityIncidentDetailsModal from "../components/portal/SecurityIncidentDetailsModal";
import { keysApi } from "../api/keys.api";
import { usersApi } from "../api/users.api";
import { authApi } from "../api/auth.api";
import { extractApiError } from "../lib/extractApiError";
import { useAdminScope } from "../hooks/useAdminScope";
import { useSettingsProfileStore } from "../store/settingsProfileStore";
import type { SettingsFormValues } from "../data/demoSettingsProfile";
import { useKeysStore } from "../store/keysStore";
import { useNotificationStore } from "../store/notificationStore";
import { useDashboardRefreshStore } from "../store/dashboardRefreshStore";
import { useTopBarRefresh } from "../hooks/useTopBarRefresh";
import {
  formatRegisteredUserId,
  getRegisterUserEmail,
  getRegisterUserFullName,
} from "../utils/registerUserDisplay";
import type { LicenseKeyDisplay } from "../utils/licenseKeyDisplay";
import type { SerialKey } from "../types";
import "../styles/admin-console.css";
import "../styles/portal-modal.css";
import "../styles/page-transition.css";
import "../styles/generate-license-keys-modal.css";
import "../styles/generate-keys-success-modal.css";
import "../styles/view-devices-modal.css";
import "../styles/provide-assistance-modal.css";
import "../styles/security-incident-details-modal.css";

const registerSchema = z.object({
  username: z.string().min(3),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  adminContactEmail: z.union([z.literal(""), z.string().email()]),
  adminContactPhone: z.union([z.literal(""), z.string().min(7)]),
  department: z.string().min(1),
  company: z.string().min(1),
  password: z.string().min(1),
});

function findAvailableKey(keys: SerialKey[], organization: string) {
  const org = organization.trim().toLowerCase();
  return keys.find((key) => {
    if (key.status !== "unused") return false;
    const company = (key.company ?? "").trim().toLowerCase();
    return !org || !company || company === org;
  });
}

async function syncAdminContactProfile(
  data: RegisterUserFormData,
  settingsProfile: SettingsFormValues,
) {
  const email = data.adminContactEmail.trim();
  const phone = data.adminContactPhone.trim();
  if (!email && !phone) return;

  if (email === settingsProfile.email.trim() && phone === settingsProfile.phone.trim()) {
    return;
  }

  await authApi.updateProfile({
    email: email || undefined,
    phoneNumber: phone || undefined,
  });

  useSettingsProfileStore.getState().saveProfile({
    ...settingsProfile,
    email,
    phone,
  });
}

export default function DashboardPage() {
  const push = useNotificationStore((s) => s.push);
  const { scope } = useAdminScope();
  const settingsProfile = useSettingsProfileStore((state) => state.formValues);
  const generateAndSave = useKeysStore((s) => s.generateAndSave);
  const bumpDashboard = useDashboardRefreshStore((s) => s.bump);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [generateKeysOpen, setGenerateKeysOpen] = useState(false);
  const [viewDevicesOpen, setViewDevicesOpen] = useState(false);
  const [provideAssistanceOpen, setProvideAssistanceOpen] = useState(false);
  const [investigateSecurityOpen, setInvestigateSecurityOpen] = useState(false);
  const [generateSaving, setGenerateSaving] = useState(false);

  const refreshDashboard = useCallback(async () => {
    bumpDashboard();
  }, [bumpDashboard]);

  const { onRefresh, refreshing, refreshToken } = useTopBarRefresh(refreshDashboard, "Dashboard refreshed");

  const openGenerateKeysModal = useCallback(() => {
    setGenerateKeysOpen(true);
  }, []);

  const closeGenerateKeysModal = useCallback(() => {
    setGenerateKeysOpen(false);
  }, []);

  const handleGenerateKeysDone = useCallback(async (license: LicenseKeyDisplay) => {
    setGenerateSaving(true);
    try {
      await generateAndSave(license);
      bumpDashboard();
      push("Serial key added to your list", "success");
      closeGenerateKeysModal();
    } catch {
      push("Failed to save serial key", "error");
    } finally {
      setGenerateSaving(false);
    }
  }, [bumpDashboard, closeGenerateKeysModal, generateAndSave, push]);

  const registerDepartmentOptions = useMemo(() => scope.departments.filter(Boolean), [scope.departments]);

  const handleRegisterSubmit = async (data: RegisterUserFormData) => {
    const organization = scope.company || data.company.trim();
    if (!organization) {
      push("Organization is still loading. Try again in a moment.", "error");
      throw new Error("Organization unavailable");
    }

    const parsed = registerSchema.safeParse({
      username: data.username.trim(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      adminContactEmail: getRegisterUserEmail(data),
      adminContactPhone: data.adminContactPhone.trim(),
      department: data.department.trim(),
      company: organization,
      password: data.defaultPassword,
    });

    if (!parsed.success) {
      push("Please complete all required fields correctly", "error");
      throw new Error("Invalid registration data");
    }

    try {
      const user = await usersApi.register({
        username: parsed.data.username,
        password: parsed.data.password,
        firstName: parsed.data.firstName,
        middleInitial: data.middleInitial.trim() || undefined,
        lastName: parsed.data.lastName,
        department: parsed.data.department,
        company: parsed.data.company,
      });

      await syncAdminContactProfile(data, settingsProfile);

      const keys = await keysApi.list();
      const availableKey = findAvailableKey(keys, parsed.data.company);
      let assignedKey = user.serialKey ?? null;

      if (availableKey) {
        const assigned = await keysApi.assign(availableKey.serialId, user.userId);
        assignedKey = assigned.serialKey;
      }

      bumpDashboard();
      push("User registered. They must activate their account before signing in.", "success");

      return {
        portalUserId: user.userId,
        userId: formatRegisteredUserId(user.userId),
        username: data.username.trim(),
        licenseKey: assignedKey ?? "-",
        fullName: getRegisterUserFullName(data),
        email: getRegisterUserEmail(data),
        organization: parsed.data.company,
        role: data.role,
        accountActive: false,
        sendWelcomeEmail: data.sendWelcomeEmail,
        requirePasswordChange: data.requirePasswordChange,
      };
    } catch (error) {
      const message = extractApiError(error, "Registration failed");
      push(message, "error");
      throw new Error(message);
    }
  };

  return (
    <>
      <TopBar onRefresh={onRefresh} refreshing={refreshing} headerVariant="dashboard" />
      <ScreenRefreshFrame refreshToken={refreshToken}>
        <AdminDashboardBody
          variant="portal"
          onRegisterUser={() => setRegisterOpen(true)}
          onGenerateKeys={openGenerateKeysModal}
          onViewDevices={() => setViewDevicesOpen(true)}
          onProvideAssistance={() => setProvideAssistanceOpen(true)}
          onInvestigateSecurity={() => setInvestigateSecurityOpen(true)}
        />
      </ScreenRefreshFrame>

      <PortalOverlay open={registerOpen} onClose={() => setRegisterOpen(false)}>
        <RegisterUserModal
          assignedOrganization={scope.company}
          departmentOptions={registerDepartmentOptions}
          adminContactDefaults={{
            email: settingsProfile.email,
            phone: settingsProfile.phone,
          }}
          onClose={() => setRegisterOpen(false)}
          onDone={() => setRegisterOpen(false)}
          onSubmit={handleRegisterSubmit}
        />
      </PortalOverlay>

      <PortalOverlay open={generateKeysOpen} onClose={closeGenerateKeysModal}>
        <GenerateLicenseKeysModal
          saving={generateSaving}
          onClose={closeGenerateKeysModal}
          onConfirm={handleGenerateKeysDone}
        />
      </PortalOverlay>

      <PortalOverlay open={viewDevicesOpen} onClose={() => setViewDevicesOpen(false)}>
        <ViewDevicesModal
          onClose={() => setViewDevicesOpen(false)}
          onScanComplete={bumpDashboard}
        />
      </PortalOverlay>

      <PortalOverlay open={provideAssistanceOpen} onClose={() => setProvideAssistanceOpen(false)}>
        <ProvideAssistanceModal onClose={() => setProvideAssistanceOpen(false)} />
      </PortalOverlay>

      <PortalOverlay open={investigateSecurityOpen} onClose={() => setInvestigateSecurityOpen(false)}>
        <SecurityIncidentDetailsModal onClose={() => setInvestigateSecurityOpen(false)} />
      </PortalOverlay>
    </>
  );
}
