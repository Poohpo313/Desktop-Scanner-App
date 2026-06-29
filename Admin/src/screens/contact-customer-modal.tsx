import PortalScreen from "../components/portal/PortalScreen";
import HelpSupportBody from "../components/portal/HelpSupportBody";
import { ContactCustomerModal } from "../components/portal/AdminModals";

const FIGMA_ID = "2212:4691";

export function ContactCustomerModalScreen() {
  return (
    <PortalScreen
      figmaId={FIGMA_ID}
      screen="contact-customer-modal"
      backdrop="admin"
      adminBreadcrumb={[{ label: "Home" }, { label: "Help & Support" }]}
      adminBody={<HelpSupportBody />}
    >
      <ContactCustomerModal />
    </PortalScreen>
  );
}

export default ContactCustomerModalScreen;
