import "../styles/stat-card.css";

type Props = {
  label: string;
  value: string | number;
  hint?: string;
  iconSrc?: string;
  iconAlt?: string;
  iconTone?: "blue" | "purple" | "green" | "amber";
};

export default function StatCard({
  label,
  value,
  hint,
  iconSrc,
  iconAlt = "",
  iconTone = "blue",
}: Props) {
  return (
    <div className="stat-card">
      <div className={`stat-card__icon-space stat-card__icon-space--${iconTone}`} aria-hidden={!iconAlt}>
        {iconSrc && <img src={iconSrc} alt={iconAlt} />}
      </div>
      <div className="stat-card__content">
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">{value}</p>
        {hint && <p className="stat-card__hint">{hint}</p>}
      </div>
    </div>
  );
}
