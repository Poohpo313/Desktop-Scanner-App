import PortalScreen from "../components/portal/PortalScreen";
import UserManagementBody from "../components/portal/UserManagementBody";
import RegisterUserModal from "../components/portal/RegisterUserModal";

const FIGMA_ID = "3526:4469";
const USER_MANAGEMENT_ROUTE = "/user-management-2226-1953";

export function UserManagementUserRegisterModalScreen() {
  return (
    <PortalScreen
      figmaId={FIGMA_ID}
      screen="user-management-user-register-modal"
      backdrop="admin"
      adminBreadcrumb={[{ label: "Dashboard" }, { label: "User Registration" }]}
      adminBody={<UserManagementBody variant="figma" />}
    >
      <RegisterUserModal closeTo={USER_MANAGEMENT_ROUTE} confirmTo={USER_MANAGEMENT_ROUTE} />
    </PortalScreen>
  );
}

export default UserManagementUserRegisterModalScreen;
