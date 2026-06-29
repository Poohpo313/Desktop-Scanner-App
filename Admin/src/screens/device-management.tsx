import AdminPortalPage from "../components/portal/AdminPortalPage";
import DeviceManagementScreenBody from "../components/portal/DeviceManagementScreenBody";

const FIGMA_ID = "2226:1460";

export function DeviceManagementScreen() {
  return (
    <AdminPortalPage
      figmaId={FIGMA_ID}
      screen="device-management"
      breadcrumb={[
        { label: "Keys", to: "/license-key-management-2226-2536" },
        { label: "Devices" },
      ]}
      showHeaderUtilities={false}
      showHeaderRefreshOnly
    >
      <DeviceManagementScreenBody />
    </AdminPortalPage>
  );
}

export default DeviceManagementScreen;
