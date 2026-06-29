import PortalScreen from "../components/portal/PortalScreen";
import UserManagementBody from "../components/portal/UserManagementBody";
import EditUserModal from "../components/portal/EditUserModal";
import { DEMO_ADMIN_USER } from "../data/demoUsers";

const FIGMA_ID = "user-management-edit-user";
const USER_MANAGEMENT_ROUTE = "/user-management-2226-1953";

export function UserManagementEditUserModalScreen() {
  return (
    <PortalScreen
      figmaId={FIGMA_ID}
      screen="user-management-edit-user-modal"
      backdrop="admin"
      adminBreadcrumb={[{ label: "Dashboard" }, { label: "User Registration" }]}
      adminBody={<UserManagementBody variant="figma" />}
    >
      <EditUserModal
        closeTo={USER_MANAGEMENT_ROUTE}
        user={DEMO_ADMIN_USER}
      />
    </PortalScreen>
  );
}

export default UserManagementEditUserModalScreen;
