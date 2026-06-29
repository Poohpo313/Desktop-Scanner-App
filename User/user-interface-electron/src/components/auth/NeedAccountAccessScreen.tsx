import { NeedAccountAccessModal } from "./need-account-access";
import "../../styles/auth-modals.css";

export function NeedAccountAccessScreen() {
  return (
    <div className="auth-modal-page">
      <NeedAccountAccessModal />
    </div>
  );
}
