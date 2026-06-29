import "../styles/registration-stat-card.css";

type Props = {
  label: string;
  value: string | number;
  iconSrc: string;
  iconAlt?: string;
  tone?: "blue" | "green" | "amber";
  toggleable?: boolean;
  onToggle?: () => void;
  toggleAriaLabel?: string;
};

export default function RegistrationStatCard({
  label,
  value,
  iconSrc,
  iconAlt = "",
  tone = "blue",
  toggleable = false,
  onToggle,
  toggleAriaLabel = "Switch summary metric",
}: Props) {
  return (
    <article className={`registration-stat-card${toggleable ? " registration-stat-card--toggleable" : ""}`}>
      <div className={`registration-stat-card__icon registration-stat-card__icon--${tone}`}>
        <img src={iconSrc} alt={iconAlt} />
      </div>
      <div className="registration-stat-card__content">
        <p className="registration-stat-card__label">{label}</p>
        <p className="registration-stat-card__value">{value}</p>
      </div>
      {toggleable && onToggle && (
        <button
          className="registration-stat-card__toggle"
          type="button"
          aria-label={toggleAriaLabel}
          onClick={onToggle}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M11.5 2.5H13.5V4.5M11.5 2.5L9.6 4.1C8.95 4.65 8.15 5.05 7.28 5.26M4.5 13.5H2.5V11.5M4.5 13.5L6.4 11.9C7.05 11.35 7.85 10.95 8.72 10.74"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </article>
  );
}
