import AdministratorRecoverAccessView from "../components/AdministratorRecoverAccessView";
import { PORTAL } from "../routes/portalPaths";

export default function AdministratorRecoverAccessPage() {
  return (
    <AdministratorRecoverAccessView
      loginHref={PORTAL.login}
      emailConfirmHref={PORTAL.recoverEmailConfirmation}
      smsConfirmHref={PORTAL.recoverSmsConfirmation}
    />
  );
}
