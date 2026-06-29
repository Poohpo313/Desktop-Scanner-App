import SmsRecoveryConfirmationView from "../components/SmsRecoveryConfirmationView";

const FIGMA_ID = "2212:1544";

export function AdminSmsRecoveryConfirmationScreen() {
  return (
    <div data-figma-id={FIGMA_ID} data-screen="admin-sms-recovery-confirmation">
      <SmsRecoveryConfirmationView />
    </div>
  );
}

export default AdminSmsRecoveryConfirmationScreen;
