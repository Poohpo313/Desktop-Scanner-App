import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { z } from "zod";
import TopBar from "../components/TopBar";
import ScreenRefreshFrame from "../components/ScreenRefreshFrame";
import UserDetailsBody from "../components/portal/UserDetailsBody";
import PortalOverlay from "../components/portal/PortalOverlay";
import EditUserModal, { type EditUserFormData } from "../components/portal/EditUserModal";
import { usersApi } from "../api/users.api";
import { applyStatusToProfile, buildUserDetailsProfile } from "../data/userDetailsDisplay";
import { useNotificationStore } from "../store/notificationStore";
import { useSettingsProfileStore } from "../store/settingsProfileStore";
import { useTopBarRefresh } from "../hooks/useTopBarRefresh";
import { PORTAL } from "../routes/portalPaths";
import type { AdminUser } from "../types";
import "../styles/portal-modal.css";
import "../styles/page-transition.css";

const editSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export default function UserDetailsPage() {
  const { userId } = useParams();
  const push = useNotificationStore((s) => s.push);
  const settingsProfile = useSettingsProfileStore((state) => state.formValues);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [statusOverride, setStatusOverride] = useState<"active" | "inactive" | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    return usersApi
      .list()
      .then((users) => {
        const found = users.find((entry) => String(entry.userId) === String(userId));
        setUser(found ?? null);
      })
      .catch(() => push("Failed to load user details", "error"))
      .finally(() => setLoading(false));
  }, [push, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setStatusOverride(null);
  }, [userId, user?.accountStatus]);

  const { onRefresh, refreshing, refreshToken } = useTopBarRefresh(load, "User details refreshed");

  const profile = useMemo(() => {
    if (!user) return null;
    const baseProfile = buildUserDetailsProfile(user);
    return applyStatusToProfile(baseProfile, statusOverride);
  }, [user, statusOverride]);

  const handleEditSubmit = async (data: EditUserFormData) => {
    if (!editUser) return;

    const parsed = editSchema.safeParse({
      firstName: data.firstName,
      lastName: data.lastName,
    });

    if (!parsed.success) {
      push("Please complete all required fields correctly", "error");
      return;
    }

    try {
      await usersApi.update(editUser.userId, {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        accountStatus: editUser.accountStatus === "active" ? "active" : "inactive",
      });
      push("User updated", "success");
      setEditUser(null);
      await load();
    } catch {
      push("Update failed", "error");
    }
  };

  const handleToggleStatus = async () => {
    if (!user || !profile?.isActive) return;

    setStatusOverride("inactive");

    try {
      await usersApi.update(user.userId, { accountStatus: "inactive" });
      push("User deactivated", "success");
      await load();
    } catch {
      setStatusOverride(null);
      push("Status update failed", "error");
    }
  };

  return (
    <>
      <TopBar
        breadcrumb={[
          { label: "User Registration", to: PORTAL.users },
          { label: "Users List", to: PORTAL.users },
          { label: "User Details" },
        ]}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />
      <ScreenRefreshFrame refreshToken={refreshToken}>
        {loading ? (
          <div className="admin-shell__content portal-empty-state">Loading user details…</div>
        ) : !profile ? (
          <div className="admin-shell__content portal-empty-state">
            User not found. Return to the{" "}
            <Link to={PORTAL.users} className="portal-empty-state__link">
              users list
            </Link>
            .
          </div>
        ) : (
          <UserDetailsBody
            profile={profile}
            backHref={PORTAL.users}
            activityLogsHref={PORTAL.activityLogs}
            onEdit={() => user && setEditUser(user)}
            onToggleStatus={() => void handleToggleStatus()}
          />
        )}
      </ScreenRefreshFrame>

      <PortalOverlay open={!!editUser} onClose={() => setEditUser(null)}>
        <EditUserModal
          key={editUser?.userId}
          user={editUser}
          adminContactDefaults={{
            email: settingsProfile.email,
            phone: settingsProfile.phone,
          }}
          onClose={() => setEditUser(null)}
          onSubmit={handleEditSubmit}
        />
      </PortalOverlay>
    </>
  );
}
