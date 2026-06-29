import EmailRecoveryConfirmationView from "../components/EmailRecoveryConfirmationView";
import { PORTAL } from "../routes/portalPaths";

export default function EmailRecoveryConfirmationPage() {
  return (
    <EmailRecoveryConfirmationView okHref={PORTAL.login} />
  );
}
