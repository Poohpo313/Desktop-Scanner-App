import { icons } from "../../icons";

const items = [
  { icon: icons.shield, label: "Admin-controlled access" },
  { icon: icons.lock, label: "Safe local scanning" },
  { icon: icons.wifi, label: "Online/Offline ready" },
];

export function AuthStatusBar() {
  return (
    <footer className="auth-status">
      {items.map((item) => (
        <span key={item.label} className="auth-status__item">
          <img src={item.icon} alt="" className="auth-status__icon" />
          {item.label}
        </span>
      ))}
    </footer>
  );
}
