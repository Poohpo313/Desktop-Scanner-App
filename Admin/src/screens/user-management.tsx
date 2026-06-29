import UserManagementFigmaShell from "../components/portal/UserManagementFigmaShell";

const FIGMA_ID = "2212:10217";

export function UserManagementScreen() {
  return <UserManagementFigmaShell figmaId={FIGMA_ID} screen="user-management" />;
}

export default UserManagementScreen;
