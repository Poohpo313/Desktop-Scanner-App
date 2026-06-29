import { Check } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { PrintCompletedState } from "./printFlow";
import "../../styles/print-flow.css";
import "../../styles/scan-offline.css";

export function PrintCompletedView() {
  const navigate = useNavigate();
  const location = useLocation();
  const completedState = (location.state as PrintCompletedState | null) ?? null;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (completedState?.selectedDocumentId) {
        navigate("/files", {
          replace: true,
          state: {
            folderId: "all",
            selectedDocumentId: completedState.selectedDocumentId,
          },
        });
        return;
      }

      navigate("/files", { replace: true });
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [completedState?.selectedDocumentId, navigate]);

  function handleDone() {
    if (completedState?.selectedDocumentId) {
      navigate("/files", {
        replace: true,
        state: {
          folderId: "all",
          selectedDocumentId: completedState.selectedDocumentId,
        },
      });
      return;
    }

    navigate("/files", { replace: true });
  }

  return (
    <div className="print-flow-page" data-screen="print-completed">
      <div className="print-completed-backdrop">
        <div className="print-completed-card" role="status" aria-live="polite">
          <div className="print-completed-card__icon-wrap">
            <Check className="print-completed-card__icon" strokeWidth={2.5} />
          </div>
          <h2 className="print-completed-card__title">Print Completed</h2>
          <p className="print-completed-card__desc">
            Your document was sent to the printer. Returning to Documents…
          </p>
          <div className="print-completed-card__actions">
            <button type="button" className="scan-btn scan-btn--primary" onClick={handleDone}>
              Go to Documents
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
