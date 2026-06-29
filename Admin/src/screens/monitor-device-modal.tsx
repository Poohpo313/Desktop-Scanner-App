import { Navigate } from "react-router-dom";

export function MonitorDeviceModalScreen() {
  return (
    <Navigate
      to="/device-management"
      replace
      state={{ monitorDevice: { id: "", name: "", networkIdentity: "" } }}
    />
  );
}

export default MonitorDeviceModalScreen;
