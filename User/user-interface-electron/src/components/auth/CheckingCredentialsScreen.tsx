import { LoaderRing } from "./LoaderRing";
import { SuccessProgress } from "./SuccessProgress";
import "../../styles/auth-modals.css";

export function CheckingCredentialsScreen() {
  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-[rgba(15,23,42,0.45)] p-5 backdrop-blur-[8px]"
      data-screen="checking-credentials"
    >
      <div className="auth-modal auth-modal--checking auth-modal--enter">
        <p className="auth-modal__label">CHECKING CREDENTIALS</p>

        <div className="auth-modal__icon-area">
          <LoaderRing />
        </div>

        <h1 className="auth-modal__title">Checking Credentials</h1>
        <p className="auth-modal__desc">
          Please wait while the system verifies your assigned account.
        </p>

        <SuccessProgress progress={40} statusText="Verifying username and password…" />
      </div>
    </div>
  );
}
