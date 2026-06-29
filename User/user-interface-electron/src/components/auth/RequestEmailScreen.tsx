import { useSearchParams } from "react-router-dom";
import { RequestEmailModal } from "./request-email";
import "../../styles/auth-modals.css";

export function RequestEmailScreen() {
  const [params] = useSearchParams();
  const context = params.get("context") ?? "activation";

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[rgba(15,23,42,0.45)] p-5 backdrop-blur-[8px]">
      <RequestEmailModal context={context} />
    </div>
  );
}
