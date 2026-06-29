type RetryButtonProps = {
  onClick: () => void;
};

export function RetryButton({ onClick }: RetryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-12 w-[140px] rounded-[10px] border border-[#CBD5E1] bg-white font-sans text-sm font-medium text-[#334155] transition-all duration-200 ease-in-out hover:border-[#94A3B8] hover:bg-[#F8FAFC]"
    >
      Retry
    </button>
  );
}
