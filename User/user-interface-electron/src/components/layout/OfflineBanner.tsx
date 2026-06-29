import { useNavigate } from "react-router-dom";
import { useAppMode } from "../../context/AppModeContext";

export function OfflineBanner() {
  const { setMode } = useAppMode();
  const navigate = useNavigate();

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-sm text-amber-900 shrink-0">
      <span>
        <strong>Working offline</strong> — cloud sync is paused. Core features use local storage.
      </span>
      <button
        type="button"
        className="btn-outline-emerald text-xs py-1.5 px-4"
        onClick={() => {
          setMode("online");
          navigate("/dashboard");
        }}
      >
        Go online
      </button>
    </div>
  );
}
