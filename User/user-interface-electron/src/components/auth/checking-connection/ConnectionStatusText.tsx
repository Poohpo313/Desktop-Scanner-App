type ConnectionStatusTextProps = {
  message: string;
  visible: boolean;
};

export function ConnectionStatusText({ message, visible }: ConnectionStatusTextProps) {
  return (
    <p
      className={`m-0 mt-3 min-h-[21px] text-center font-sans text-sm font-medium text-[#64748B] transition-opacity duration-[250ms] ease-in-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      aria-live="polite"
    >
      {message}
    </p>
  );
}
