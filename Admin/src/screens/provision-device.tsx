import PortalScreen from "../components/portal/PortalScreen";
import DeviceManagementBody from "../components/portal/DeviceManagementBody";
import ProvisionDeviceBody from "../components/portal/ProvisionDeviceBody";

const FIGMA_ID = "2212:10846";

export function ProvisionDeviceScreen() {
  return (
    <PortalScreen
      figmaId={FIGMA_ID}
      screen="provision-device"
      backdrop="admin"
      adminBreadcrumb={[{ label: "Keys" }, { label: "Devices" }]}
      adminBody={<DeviceManagementBody />}
    >
      <ProvisionDeviceBody presentation="overlay" />
    </PortalScreen>
  );
}

export default ProvisionDeviceScreen;
