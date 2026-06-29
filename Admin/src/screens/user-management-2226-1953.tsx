import UserManagementFigmaShell from "../components/portal/UserManagementFigmaShell";

const FIGMA_ID = "2226:1953";
const DASHBOARD_HREF = "/admin-dashboard-2226-1193";

export function UserManagement22261953Screen() {
  return (
    <UserManagementFigmaShell
      figmaId={FIGMA_ID}
      screen="user-management-2226-1953"
      layout="registration"
      breadcrumb={[
        { label: "Dashboard", to: DASHBOARD_HREF },
        { label: "User Registration" },
      ]}
    />
  );
}

export default UserManagement22261953Screen;
