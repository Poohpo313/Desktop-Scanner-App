import { Link } from "react-router-dom";

type Trend = "up" | "down" | "neutral";

type Props = {
  label: string;
  value: string;
  valueDetail?: string;
  trend?: string;
  trendDirection?: Trend;
  progress?: number;
  to?: string;
};

function StatCardContent({
  label,
  value,
  valueDetail,
  trend,
  trendDirection = "neutral",
  progress,
}: Omit<Props, "to">) {
  return (
    <>
      <p className="dash-stat__label">{label}</p>
      <p className="dash-stat__value">{value}</p>
      {valueDetail ? <p className="dash-stat__value-detail">{valueDetail}</p> : null}
      {progress != null ? (
        <div
          className="dash-stat__progress"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${progress}%`}
        >
          <div className="dash-stat__progress-fill" style={{ width: `${progress}%` }} />
        </div>
      ) : null}
      {trend ? (
        <p className={`dash-stat__trend dash-stat__trend--${trendDirection}`}>{trend}</p>
      ) : null}
    </>
  );
}

export function StatCard({
  label,
  value,
  valueDetail,
  trend,
  trendDirection = "neutral",
  progress,
  to,
}: Props) {
  const ariaLabel = valueDetail ? `${label}: ${value} ${valueDetail}` : `${label}: ${value}`;

  if (to) {
    return (
      <Link to={to} className="dash-stat dash-stat--link" aria-label={`${ariaLabel}. View documents.`}>
        <StatCardContent
          label={label}
          value={value}
          valueDetail={valueDetail}
          trend={trend}
          trendDirection={trendDirection}
          progress={progress}
        />
      </Link>
    );
  }

  return (
    <article className="dash-stat">
      <StatCardContent
        label={label}
        value={value}
        valueDetail={valueDetail}
        trend={trend}
        trendDirection={trendDirection}
        progress={progress}
      />
    </article>
  );
}
