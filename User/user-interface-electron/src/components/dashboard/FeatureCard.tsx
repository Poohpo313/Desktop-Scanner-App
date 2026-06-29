import type { ReactNode } from "react";
import { FigmaIcon } from "../FigmaIcon";
import type { IconName } from "../../icons";

type Props = {
  icon?: IconName;
  iconNode?: ReactNode;
  title: string;
  description: string;
};

export function FeatureCard({ icon, iconNode, title, description }: Props) {
  return (
    <article className="dash-feature">
      <div className="dash-feature__icon">
        {iconNode ?? (icon ? <FigmaIcon name={icon} className="w-5 h-5" /> : null)}
      </div>
      <h3 className="dash-feature__title">{title}</h3>
      <p className="dash-feature__desc">{description}</p>
    </article>
  );
}
