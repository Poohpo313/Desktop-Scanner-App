import EmailRecoveryConfirmationView from "../components/EmailRecoveryConfirmationView";

const FIGMA_ID = "2212:1533";

export function AdminEmailRecoveryConfirmationScreen() {
  return (
    <div data-figma-id={FIGMA_ID} data-screen="admin-email-recovery-confirmation">
      <EmailRecoveryConfirmationView />
    </div>
  );
}

export default AdminEmailRecoveryConfirmationScreen;
