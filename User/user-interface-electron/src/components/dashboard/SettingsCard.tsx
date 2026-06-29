const SETTINGS = [
  { label: "Source", value: "Auto Detect" },
  { label: "Color Mode", value: "Color" },
  { label: "Resolution", value: "300 DPI" },
  { label: "File Format", value: "PDF" },
  { label: "Save Mode", value: "Auto-save / Multi-folder" },
  { label: "Default Location", value: "Documents\\Scans" },
];

export function SettingsCard() {
  return (
    <section className="dash-settings">
      <h2 className="dash-settings__title">Default Scan Settings</h2>
      <dl className="dash-settings__list">
        {SETTINGS.map((item) => (
          <div key={item.label} className="dash-settings__row">
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
      <button type="button" className="dash-settings__btn">
        Edit Settings
      </button>
    </section>
  );
}
