import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import TopBar from "../components/TopBar";
import ScreenRefreshFrame from "../components/ScreenRefreshFrame";
import UserRegistrationScreenBody from "../components/portal/UserRegistrationScreenBody";
import PortalOverlay from "../components/portal/PortalOverlay";
import RegisterUserModal, { type RegisterUserFormData } from "../components/portal/RegisterUserModal";
import {
  getRegisterUserEmail,
  getRegisterUserFullName,
  formatRegisteredUserId,
} from "../utils/registerUserDisplay";
import EditUserModal, { parseNameParts, type EditUserFormData, type EditUserProfileDefaults } from "../components/portal/EditUserModal";
import DeleteUserProfileModal from "../components/portal/DeleteUserProfileModal";
import DeactivationRequestSubmittedModal from "../components/portal/DeactivationRequestSubmittedModal";
import { usersApi } from "../api/users.api";
import { keysApi } from "../api/keys.api";
import { authApi } from "../api/auth.api";
import { extractApiError } from "../lib/extractApiError";
import { useNotificationStore } from "../store/notificationStore";
import { useTopBarRefresh } from "../hooks/useTopBarRefresh";
import { useAdminScope } from "../hooks/useAdminScope";
import { useSettingsProfileStore } from "../store/settingsProfileStore";
import type { SettingsFormValues } from "../data/demoSettingsProfile";
import {
  buildDepartmentOptions,
  buildRegistrationStats,
  mapUsersToRegistrationRows,
} from "../lib/adminPortalMappers";
import { PORTAL } from "../routes/portalPaths";
import type { AdminUser, SerialKey } from "../types";
import type { UserRegistrationRow } from "../data/demoUserRegistration";
import "../styles/user-registration-screen.css";
import "../styles/filter-picker-modal.css";
import "../styles/portal-modal.css";
import "../styles/delete-user-profile-modal.css";
import "../styles/deactivation-request-submitted-modal.css";
import "../styles/page-transition.css";

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

const editSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

function registrationRowToAdminUser(row: UserRegistrationRow, source?: AdminUser): AdminUser {
  const { firstName, lastName } = parseNameParts(row.name);
  return {
    userId: row.id,
    username: row.username,
    firstName: source?.firstName ?? firstName,
    middleInitial: source?.middleInitial ?? undefined,
    lastName: source?.lastName ?? lastName,
    email: source?.email ?? "",
    phoneNumber: source?.phoneNumber ?? "",
    department: source?.department ?? row.department,
    company: source?.company ?? row.organization,
    accountStatus: source?.accountStatus ?? row.status,
    serialKey: source?.serialKey ?? row.serialKey,
    createdAt: source?.createdAt ?? `${row.registeredDate}T09:00:00.000Z`,
  };
}

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

export default function UserManagementPage() {
  const { scope } = useAdminScope();
  const settingsProfile = useSettingsProfileStore((state) => state.formValues);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [keys, setKeys] = useState<SerialKey[]>([]);
  const [pendingRevocations, setPendingRevocations] = useState<
    Array<{ requestType: string; targetId: number; status: string }>
  >([]);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editProfile, setEditProfile] = useState<EditUserProfileDefaults | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<UserRegistrationRow | null>(null);
  const [deactivateSuccessOpen, setDeactivateSuccessOpen] = useState(false);
  const push = useNotificationStore((s) => s.push);

  const load = useCallback(() => {
    Promise.all([usersApi.list(), keysApi.list(), keysApi.listRevocationRequests()])
      .then(([nextUsers, nextKeys, nextRevocations]) => {
        setUsers(nextUsers);
        setKeys(nextKeys);
        setPendingRevocations(nextRevocations);
      })
      .catch(() => push("Failed to load users", "error"));
  }, [push]);

  useEffect(() => {
    load();
  }, [load]);

  const { onRefresh, refreshing, refreshToken } = useTopBarRefresh(load, "User list refreshed");

  const registrationRows = useMemo(
    () => mapUsersToRegistrationRows(users, scope.company, keys, pendingRevocations),
    [users, scope.company, keys, pendingRevocations],
  );

  const registrationStats = useMemo(
    () => buildRegistrationStats(registrationRows, keys),
    [registrationRows, keys],
  );

  const registrationDepartmentOptions = useMemo(
    () => buildDepartmentOptions(registrationRows),
    [registrationRows],
  );

  const registerDepartmentOptions = useMemo(() => {
    const assigned = scope.departments.filter(Boolean);
    if (assigned.length > 0) {
      return assigned;
    }

    return registrationDepartmentOptions
      .filter((option) => option.value !== "all")
      .map((option) => option.label);
  }, [scope.departments, registrationDepartmentOptions]);

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

      let assignedKey = user.serialKey ?? null;
      const availableKey = findAvailableKey(keys, parsed.data.company);

      if (availableKey) {
        const assigned = await keysApi.assign(availableKey.serialId, user.userId);
        assignedKey = assigned.serialKey;
      }

      push("User registered. They must activate their account before signing in.", "success");
      load();

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

  const handleEditSubmit = async (data: EditUserFormData) => {
    if (!editUser) return;

    const parsed = editSchema.safeParse({
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
    });

    if (!parsed.success) {
      push("Please complete all required fields correctly", "error");
      return;
    }

    try {
      await usersApi.update(editUser.userId, {
        firstName: parsed.data.firstName,
        middleInitial: data.middleInitial.trim() || undefined,
        lastName: parsed.data.lastName,
        department: data.department.trim() || undefined,
        company: data.company.trim() || undefined,
        accountStatus: editUser.accountStatus === "active" ? "active" : "inactive",
      });
      push("User updated", "success");
      setEditUser(null);
      setEditProfile(null);
      load();
    } catch (error) {
      push(extractApiError(error, "Update failed"), "error");
    }
  };

  const handleDeactivateSubmit = async (_payload: {
    reasonId: string;
    otherReason?: string;
  }) => {
    if (!deactivateTarget) return;

    try {
      await usersApi.update(deactivateTarget.id, { accountStatus: "inactive" });
      push("User deactivated", "success");
      setDeactivateTarget(null);
      setDeactivateSuccessOpen(true);
      load();
    } catch {
      push("Deactivation failed", "error");
    }
  };

  return (
    <>
      <TopBar
        breadcrumb={[{ label: "Dashboard", to: PORTAL.dashboard }, { label: "User Registration" }]}
        onRefresh={onRefresh}
        refreshing={refreshing}
        showUtilities={false}
      />
      <ScreenRefreshFrame refreshToken={refreshToken}>
        <UserRegistrationScreenBody
          rows={registrationRows}
          stats={registrationStats}
          assignedOrganization={scope.company}
          departmentOptions={registrationDepartmentOptions}
          onRegister={() => setRegisterOpen(true)}
          onEdit={(row) => {
            const fullUser = users.find((user) => user.userId === row.id);
            const nameParts = parseNameParts(row.name);
            setEditUser(registrationRowToAdminUser(row, fullUser));
            setEditProfile({
              middleInitial: fullUser?.middleInitial ?? nameParts.middleInitial,
              department: fullUser?.department ?? row.department,
              company: fullUser?.company ?? row.organization,
            });
          }}
          onDeactivate={setDeactivateTarget}
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

      <PortalOverlay open={!!editUser} onClose={() => { setEditUser(null); setEditProfile(null); }}>
        <EditUserModal
          key={editUser?.userId}
          user={editUser}
          profile={editProfile ?? undefined}
          adminContactDefaults={{
            email: settingsProfile.email,
            phone: settingsProfile.phone,
          }}
          onClose={() => { setEditUser(null); setEditProfile(null); }}
          onSubmit={handleEditSubmit}
        />
      </PortalOverlay>

      <PortalOverlay
        open={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
      >
        {deactivateTarget ? (
          <DeleteUserProfileModal
            user={deactivateTarget}
            onCancel={() => setDeactivateTarget(null)}
            onSubmit={handleDeactivateSubmit}
          />
        ) : null}
      </PortalOverlay>

      <PortalOverlay open={deactivateSuccessOpen} onClose={() => setDeactivateSuccessOpen(false)}>
        <DeactivationRequestSubmittedModal onDone={() => setDeactivateSuccessOpen(false)} />
      </PortalOverlay>
    </>
  );
}
