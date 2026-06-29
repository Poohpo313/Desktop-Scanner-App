import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AccountActivatedModal, ActivationBackdrop } from "./account-activated";
import "../../styles/auth-modals.css";

export function AccountActivatedScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [navigate]);

  return (
    <ActivationBackdrop>
      <AccountActivatedModal />
    </ActivationBackdrop>
  );
}
