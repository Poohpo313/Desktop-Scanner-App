import { icons, type IconName } from "../icons";

type Props = {
  name: IconName;
  className?: string;
  /** White icons on dark sidebar */
  inverse?: boolean;
  alt?: string;
};

export function FigmaIcon({ name, className = "w-5 h-5", inverse = false, alt = "" }: Props) {
  return (
    <img
      src={icons[name]}
      alt={alt}
      className={`${className} object-contain shrink-0 ${inverse ? "brightness-0 invert" : ""}`}
      aria-hidden={!alt}
    />
  );
}
