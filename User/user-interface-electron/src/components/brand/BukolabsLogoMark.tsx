import { logos } from "../../icons";

type Props = {
  className?: string;
  title?: string;
};

/** Official Bukolabs ribbon logo — `bukolabs-logo 1-1.png` */
export function BukolabsLogoMark({ className = "", title = "Bukolabs" }: Props) {
  return (
    <img
      className={className}
      src={logos.primary}
      alt={title}
      draggable={false}
    />
  );
}
