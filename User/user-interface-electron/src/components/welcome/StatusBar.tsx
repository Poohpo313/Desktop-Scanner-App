import { FigmaIcon } from "../FigmaIcon";
import type { IconName } from "../../icons";

const items: { icon: IconName; label: string }[] = [
  { icon: "shield", label: "Admin-controlled access" },
  { icon: "lock", label: "Safe local scanning" },
  { icon: "wifi", label: "Online/Offline ready" },
];

export function StatusBar() {
  return (
    <footer className="status-bar">
      {items.map((item) => (
        <span key={item.label} className="status-bar__item">
          <FigmaIcon name={item.icon} className="status-bar__icon" />
          {item.label}
        </span>
      ))}
    </footer>
  );
}
