import { icons } from "../../icons";

const ITEMS = [
  { icon: icons.shield, label: "Admin-controlled access" },
  { icon: icons.lock, label: "Safe local scanning" },
  { icon: icons.wifi, label: "Online/Offline ready" },
];

export function ActivateStatusBar() {
  return (
    <footer className="activate-status" aria-label="Product status">
      {ITEMS.map((item, index) => (
        <span key={item.label} className="activate-status__group">
          {index > 0 && <span className="activate-status__divider" aria-hidden="true" />}
          <span className="activate-status__item">
            <img src={item.icon} alt="" className="activate-status__icon" />
            {item.label}
          </span>
        </span>
      ))}
    </footer>
  );
}
