import SmsRecoveryConfirmationView from "../components/SmsRecoveryConfirmationView";
import { PORTAL } from "../routes/portalPaths";

export default function SmsRecoveryConfirmationPage() {
  return <SmsRecoveryConfirmationView okHref={PORTAL.login} />;
}
