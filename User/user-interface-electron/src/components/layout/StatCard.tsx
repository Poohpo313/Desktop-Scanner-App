type Props = {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
};

export function StatCard({ label, value, icon }: Props) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="stat-card__label">{label}</p>
          <p className="stat-card__value">{value}</p>
        </div>
        {icon && <div className="text-brand-powder opacity-80">{icon}</div>}
      </div>
    </div>
  );
}
