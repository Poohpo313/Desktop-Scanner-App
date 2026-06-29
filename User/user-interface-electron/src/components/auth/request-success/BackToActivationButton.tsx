import { useNavigate } from "react-router-dom";

type BackToActivationButtonProps = {
  to: string;
  label: string;
};

export function BackToActivationButton({ to, label }: BackToActivationButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className="h-12 min-w-[210px] rounded-xl border-0 bg-[#0B5F58] px-8 font-sans text-[15px] font-semibold text-white transition-colors duration-200 ease-in-out hover:bg-[#0A524C] active:bg-[#094842]"
      onClick={() => navigate(to, { replace: true })}
    >
      {label}
    </button>
  );
}
