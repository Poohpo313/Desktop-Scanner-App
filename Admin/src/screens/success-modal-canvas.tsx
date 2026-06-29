import PortalScreen from "../components/portal/PortalScreen";
import { SuccessModalCard } from "../components/recovery/RecoveryModals";

const FIGMA_ID = "2212:3898";

export function SuccessModalCanvasScreen() {
  return (
    <PortalScreen figmaId={FIGMA_ID} screen="success-modal-canvas" backdrop="login">
      <SuccessModalCard title="Action Completed Successfully" />
    </PortalScreen>
  );
}

export default SuccessModalCanvasScreen;
