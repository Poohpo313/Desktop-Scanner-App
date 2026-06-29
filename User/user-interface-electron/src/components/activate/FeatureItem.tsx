import { icons, type IconName } from "../../icons";

type Props = {
  icon: IconName;
  title: string;
  description: string;
};

export function FeatureItem({ icon, title, description }: Props) {
  return (
    <article className="activate-feature">
      <div className="activate-feature__icon">
        <img src={icons[icon]} alt="" />
      </div>
      <div className="activate-feature__body">
        <h2 className="activate-feature__title">{title}</h2>
        <p className="activate-feature__text">{description}</p>
      </div>
    </article>
  );
}
