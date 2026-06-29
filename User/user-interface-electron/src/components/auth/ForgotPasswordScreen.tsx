import { ForgotPasswordModal } from "./forgot-password";
import "../../styles/auth-modals.css";

export function ForgotPasswordScreen() {
  return (
    <div className="auth-modal-page">
      <ForgotPasswordModal />
    </div>
  );
}
