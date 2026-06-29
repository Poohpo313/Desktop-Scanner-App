import { Navigate } from "react-router-dom";

export function CheckDeviceStatusModalScreen() {
  return (
    <Navigate
      to="/device-management"
      replace
      state={{ checkStatus: { id: "", name: "", networkIdentity: "" } }}
    />
  );
}

export default CheckDeviceStatusModalScreen;
