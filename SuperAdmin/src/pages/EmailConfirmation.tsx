import { useNavigate } from "react-router-dom";
import AuthPanelHeader from "../components/AuthPanelHeader";
import SecurityAssurances from "../components/SecurityAssurances";
import "../styles/email-confirmation.css";

export default function EmailConfirmation() {
  const navigate = useNavigate();

  return (
    <main className="email-confirmation-page">
      <section className="email-confirmation">
        <AuthPanelHeader
          iconSrc="/assets/Mail-Logo.svg"
          iconFrameClassName="email-confirmation__icon-frame"
          title="Check Your Email"
          subtitle="We have sent recovery instructions to reset your administrator PIN."
          titleClassName="email-confirmation__title"
          subtitleClassName="email-confirmation__subtitle"
          contentClassName="email-confirmation__content"
        />

        <button
          className="email-confirmation__button"
          type="button"
          onClick={() => navigate("/portal/login", { replace: true, state: { skipSplash: true } })}
        >
          OK
        </button>

        <SecurityAssurances className="email-confirmation__footer" />
      </section>
    </main>
  );
}
