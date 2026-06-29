import { FigmaIcon } from "../FigmaIcon";
import type { IconName } from "../../icons";

type Props = {
  label: string;
  icon?: IconName;
  active?: boolean;
  onClick?: () => void;
  title?: string;
  className?: string;
};

export function StatusBadge({ label, icon = "shieldCheck", active = true, onClick, title, className }: Props) {
  const classNameMerged = `dash-status-badge${active ? "" : " dash-status-badge--muted"}${onClick ? " dash-status-badge--clickable" : ""}${className ? ` ${className}` : ""}`;

  const content = (
    <>
      <span className={`dash-status-badge__dot${active ? "" : " dash-status-badge__dot--muted"}`} />
      <FigmaIcon name={icon} className="dash-status-badge__icon" />
      {label}
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={classNameMerged} onClick={onClick} title={title}>
        {content}
      </button>
    );
  }

  return <span className={classNameMerged}>{content}</span>;
}
