type ContinueOfflineButtonProps = {
  onClick: () => void;
};

export function ContinueOfflineButton({ onClick }: ContinueOfflineButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-12 w-[170px] rounded-[10px] border-0 bg-[linear-gradient(180deg,#008768_0%,#00755B_100%)] font-sans text-sm font-semibold text-white shadow-[0_10px_20px_rgba(0,135,104,0.24)] transition-all duration-200 ease-in-out hover:-translate-y-px hover:bg-[linear-gradient(180deg,#009A77_0%,#008768_100%)]"
    >
      Continue Offline
    </button>
  );
}
