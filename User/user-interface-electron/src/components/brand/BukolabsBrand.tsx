import { BukolabsLogoMark } from "./BukolabsLogoMark";
import "../../styles/brand.css";

type Variant = "welcome" | "auth" | "sidebar" | "splash" | "compact";

type Props = {
  variant?: Variant;
  className?: string;
  /** Light text for compact variant on dark backgrounds */
  tone?: "default" | "light";
};

/** Bukolabs brand row — `bukolabs-logo 1-1.png` + wordmark */
export function BukolabsBrand({ variant = "welcome", className = "", tone = "default" }: Props) {
  const toneClass = variant === "compact" && tone === "light" ? " bukolabs-brand--light" : "";

  return (
    <div
      className={`bukolabs-brand bukolabs-brand--${variant}${toneClass} ${className}`.trim()}
    >
      <BukolabsLogoMark className="bukolabs-brand__mark" />
      <div className="bukolabs-brand__text">
        <span className="bukolabs-brand__name">bukolabs.io</span>
        <span className="bukolabs-brand__tag">infinite possibilities</span>
      </div>
    </div>
  );
}
