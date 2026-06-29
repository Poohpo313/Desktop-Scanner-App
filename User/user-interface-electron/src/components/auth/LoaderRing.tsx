type Props = {
  size?: number;
  className?: string;
};

export function LoaderRing({ size = 74, className = "" }: Props) {
  return (
    <div
      className={`auth-loader-ring ${className}`.trim()}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    >
      <svg viewBox="0 0 74 74" fill="none" aria-hidden="true">
        <circle cx="37" cy="37" r="30" stroke="#CFE5E1" strokeWidth="7" />
        <circle
          className="auth-loader-ring__arc"
          cx="37"
          cy="37"
          r="30"
          stroke="#007A63"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray="60 130"
        />
      </svg>
    </div>
  );
}
