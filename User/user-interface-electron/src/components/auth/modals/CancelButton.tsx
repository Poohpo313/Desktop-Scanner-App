type CancelButtonProps = {
  onClick: () => void;
  label?: string;
};

export function CancelButton({ onClick, label = "Cancel" }: CancelButtonProps) {
  return (
    <button
      type="button"
      className="h-12 w-[142px] rounded-[10px] border border-[rgba(0,135,104,0.25)] bg-white font-sans text-[15px] font-medium text-[#003534] transition-all duration-200 ease-in-out hover:-translate-y-px hover:border-[rgba(0,135,104,0.45)] hover:bg-[#F8FAFC]"
      onClick={onClick}
    >
      {label}
    </button>
  );
}
