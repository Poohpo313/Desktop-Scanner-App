type SendRequestButtonProps = {
  onClick: () => void;
  label?: string;
};

export function SendRequestButton({
  onClick,
  label = "Send Request",
}: SendRequestButtonProps) {
  return (
    <button
      type="button"
      className="h-12 w-[142px] rounded-[10px] border-0 bg-[linear-gradient(180deg,#008768_0%,#00755B_100%)] font-sans text-[15px] font-medium text-white shadow-[0_8px_20px_rgba(0,135,104,0.25)] transition-all duration-200 ease-in-out hover:-translate-y-px hover:bg-[linear-gradient(180deg,#009A77_0%,#008768_100%)] hover:shadow-[0_12px_28px_rgba(0,135,104,0.35)]"
      onClick={onClick}
    >
      {label}
    </button>
  );
}
