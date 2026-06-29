type ActivationProgressProps = {
  progress: number;
};

export function ActivationProgress({ progress }: ActivationProgressProps) {
  const width = Math.min(100, Math.max(0, progress));

  return (
    <div className="mt-8 flex w-full flex-col items-center">
      <div className="h-2.5 w-[270px] max-w-full overflow-hidden rounded-full bg-[#D8E7E5]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#003534_0%,#008768_100%)] transition-[width] duration-[400ms] ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
      <p className="m-0 mt-3 font-sans text-[13px] font-medium text-[#94A3B8]">Activation complete</p>
    </div>
  );
}
