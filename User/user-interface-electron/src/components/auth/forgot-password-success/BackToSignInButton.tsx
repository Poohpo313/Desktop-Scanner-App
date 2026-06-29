import { useNavigate } from "react-router-dom";

export function BackToSignInButton() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className="h-12 min-w-[210px] rounded-xl border-0 bg-[#0B5F58] px-8 font-sans text-[15px] font-semibold text-white transition-colors duration-200 ease-in-out hover:bg-[#0A524C] active:bg-[#094842]"
      onClick={() => navigate("/login", { replace: true })}
    >
      Back to Sign In
    </button>
  );
}
