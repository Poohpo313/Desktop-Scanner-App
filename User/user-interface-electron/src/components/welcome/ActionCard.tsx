import { Link } from "react-router-dom";
import { FigmaIcon } from "../FigmaIcon";
import type { IconName } from "../../icons";

type Props = {
  to: string;
  icon: IconName;
  title: string;
  description: string;
};

export function ActionCard({ to, icon, title, description }: Props) {
  return (
    <Link to={to} className="action-card">
      <div className="action-card__icon-wrap">
        <FigmaIcon name={icon} className="action-card__icon" />
      </div>
      <div className="action-card__content">
        <span className="action-card__title">{title}</span>
        <span className="action-card__desc">{description}</span>
      </div>
      <FigmaIcon name="arrowRight" className="action-card__arrow" />
    </Link>
  );
}
