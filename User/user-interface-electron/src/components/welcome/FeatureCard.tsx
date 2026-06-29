import { FigmaIcon } from "../FigmaIcon";
import type { IconName } from "../../icons";

type Props = {
  icon: IconName;
  title: string;
  description: string;
};

export function FeatureCard({ icon, title, description }: Props) {
  return (
    <article className="feature-card">
      <div className="feature-card__icon-wrap">
        <FigmaIcon name={icon} className="feature-card__icon" />
      </div>
      <h3 className="feature-card__title">{title}</h3>
      <p className="feature-card__desc">{description}</p>
    </article>
  );
}
