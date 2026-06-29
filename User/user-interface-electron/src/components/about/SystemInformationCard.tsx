const SYSTEM_INFO = [
  { label: "Platform", value: "Windows 11 Pro 64-bit" },
  { label: "App Version", value: "1.2.0 (Build 1200)" },
  { label: "Electron", value: "28.2.0" },
  { label: "Node.js", value: "18.17.1" },
  { label: "Chromium", value: "120.0.6099.199" },
  { label: "Machine ID", value: "83ac6c5f-04ab-4a52-b8f4" },
] as const;

export function SystemInformationCard() {
  return (
    <article className="about-card about-card--system">
      <h2 className="about-card__system-title">System Information</h2>

      <ul className="about-system-list">
        {SYSTEM_INFO.map((item) => (
          <li key={item.label} className="about-system-list__item">
            <span className="about-system-list__label">{item.label}</span>
            <span className="about-system-list__value">{item.value}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
