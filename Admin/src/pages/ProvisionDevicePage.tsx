import { Navigate } from "react-router-dom";
import { PORTAL } from "../routes/portalPaths";

export default function ProvisionDevicePage() {
  return <Navigate to={PORTAL.devices} replace state={{ provision: true }} />;
}
