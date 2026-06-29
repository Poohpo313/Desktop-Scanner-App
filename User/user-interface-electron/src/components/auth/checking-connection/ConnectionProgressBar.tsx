type ConnectionProgressBarProps = {
  progress: number;
};

export function ConnectionProgressBar({ progress }: ConnectionProgressBarProps) {
  const width = Math.min(100, Math.max(0, progress));

  return (
    <div className="mt-3 h-2.5 w-[370px] max-w-full overflow-hidden rounded-full bg-[#D8E7E5]">
      <div
        className="validation-progress-fill h-full rounded-full bg-[linear-gradient(90deg,#003534_0%,#008768_100%)] transition-[width] duration-[400ms] ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
