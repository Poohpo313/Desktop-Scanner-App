type SecurityAssurance = {
  icon: string;
  label: string;
};

type Props = {
  className: string;
  items?: SecurityAssurance[];
};

const defaultItems: SecurityAssurance[] = [
  { icon: "\u{1F6E1}", label: "Secure" },
  { icon: "\u{1F464}", label: "Role-Based Access" },
  { icon: "\u{1F512}", label: "Data Protected" },
];

export default function SecurityAssurances({ className, items = defaultItems }: Props) {
  return (
    <div className={className} aria-label="Security assurances">
      {items.map((item) => (
        <span key={item.label}>
          {item.icon} {item.label}
        </span>
      ))}
    </div>
  );
}
