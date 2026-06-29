type Props = {
  progress: number;
  statusText: string;
  animate?: boolean;
};

export function SuccessProgress({ progress, statusText, animate = true }: Props) {
  const pct = Math.min(100, Math.max(0, progress));

  return (
    <div className="auth-progress-block">
      <div className="auth-progress-block__track">
        <div
          className={`auth-progress-block__fill${animate ? " auth-progress-block__fill--animate" : ""}`}
          style={{ width: animate ? undefined : `${pct}%`, ["--progress" as string]: `${pct}%` }}
        />
      </div>
      <p className="auth-progress-block__status">{statusText}</p>
    </div>
  );
}
