import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

type CloseButtonProps = {
  fallbackTo?: string;
};

export function CloseButton({ fallbackTo = "/activate" }: CloseButtonProps) {
  const navigate = useNavigate();

  function handleClose() {
    navigate(fallbackTo, { replace: true });
  }

  return (
    <button
      type="button"
      className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-[10px] text-[#64748B] transition-colors hover:bg-[rgba(15,23,42,0.05)]"
      onClick={handleClose}
      aria-label="Close"
    >
      <X className="h-5 w-5" strokeWidth={1.8} />
    </button>
  );
}
