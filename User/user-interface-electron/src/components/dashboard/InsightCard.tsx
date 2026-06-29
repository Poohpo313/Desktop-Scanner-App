import { FigmaIcon } from "../FigmaIcon";
import type { IconName } from "../../icons";

type Props = {
  icon: IconName;
  title: string;
  description: string;
};

export function InsightCard({ icon, title, description }: Props) {
  return (
    <article className="dash-insight">
      <div className="dash-insight__icon">
        <FigmaIcon name={icon} className="w-5 h-5" />
      </div>
      <h3 className="dash-insight__title">{title}</h3>
      <p className="dash-insight__desc">{description}</p>
    </article>
  );
}
