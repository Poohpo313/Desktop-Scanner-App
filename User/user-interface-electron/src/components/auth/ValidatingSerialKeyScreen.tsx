import { ValidatingSerialKeyModal, ValidationBackdrop } from "./validating-serial-key";
import "../../styles/auth-modals.css";

export function ValidatingSerialKeyScreen() {
  return (
    <ValidationBackdrop>
      <ValidatingSerialKeyModal />
    </ValidationBackdrop>
  );
}
