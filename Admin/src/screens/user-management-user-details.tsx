import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import AdminPortalPage from "../components/portal/AdminPortalPage";
import UserDetailsBody from "../components/portal/UserDetailsBody";
import PortalOverlay from "../components/portal/PortalOverlay";
import EditUserModal from "../components/portal/EditUserModal";
import { getDemoAdminUserById } from "../data/demoUsers";
import { applyStatusToProfile, buildDemoDetailsProfile } from "../data/userDetailsDisplay";
import { useNotificationStore } from "../store/notificationStore";
import "../styles/portal-modal.css";

const FIGMA_ID = "user-details";
const USER_MANAGEMENT_ROUTE = "/user-management-2226-1953";

export function UserManagementUserDetailsScreen() {
  const { userId = "1" } = useParams();
  const push = useNotificationStore((s) => s.push);
  const [editOpen, setEditOpen] = useState(false);
  const [statusOverride, setStatusOverride] = useState<"active" | "inactive" | null>(null);

  const adminUser = useMemo(() => getDemoAdminUserById(userId), [userId]);

  useEffect(() => {
    setStatusOverride(null);
  }, [userId]);

  const baseProfile = useMemo(() => buildDemoDetailsProfile(userId), [userId]);
  const profile = useMemo(
    () => applyStatusToProfile(baseProfile, statusOverride),
    [baseProfile, statusOverride]
  );

  const handleToggleStatus = () => {
    if (!profile.isActive) return;
    setStatusOverride("inactive");
    push("User deactivated", "success");
  };

  return (
    <AdminPortalPage
      figmaId={FIGMA_ID}
      screen="user-management-user-details"
      breadcrumb={[
        { label: "User Registration", to: USER_MANAGEMENT_ROUTE },
        { label: "Users List", to: USER_MANAGEMENT_ROUTE },
        { label: "User Details" },
      ]}
      homeHref="/admin-dashboard-2226-1193"
    >
      <UserDetailsBody
        profile={profile}
        backHref={USER_MANAGEMENT_ROUTE}
        activityLogsHref="/admin-dashboard-activity-logs"
        onEdit={() => setEditOpen(true)}
        onToggleStatus={handleToggleStatus}
      />

      <PortalOverlay open={editOpen} onClose={() => setEditOpen(false)}>
        <EditUserModal
          key={adminUser.userId}
          user={adminUser}
          onClose={() => setEditOpen(false)}
          onSubmit={() => setEditOpen(false)}
        />
      </PortalOverlay>
    </AdminPortalPage>
  );
}

export default UserManagementUserDetailsScreen;
