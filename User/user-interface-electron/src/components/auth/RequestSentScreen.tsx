import { useSearchParams } from "react-router-dom";
import { ForgotPasswordSuccessModal } from "./forgot-password-success";
import { RequestSuccessModal } from "./request-success";
import "../../styles/auth-modals.css";

type RequestSentScreenProps = {
  context?: string;
};

export function RequestSentScreen({ context: contextProp }: RequestSentScreenProps = {}) {
  const [params] = useSearchParams();
  const context = contextProp ?? params.get("context") ?? "activation";
  const isForgot = context === "forgot";

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[rgba(15,23,42,0.45)] p-5 backdrop-blur-[8px]">
      {isForgot ? <ForgotPasswordSuccessModal /> : <RequestSuccessModal />}
    </div>
  );
}
