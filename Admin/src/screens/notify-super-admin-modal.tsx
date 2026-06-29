import { Navigate } from "react-router-dom";

export function NotifySuperAdminModalScreen() {
  return (
    <Navigate
      to="/device-management"
      replace
      state={{ notifyAdmin: { id: "", name: "" } }}
    />
  );
}

export default NotifySuperAdminModalScreen;
