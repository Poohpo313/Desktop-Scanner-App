import { BukolabsBrand } from "./brand/BukolabsBrand";
import { BukolabsLogoMark } from "./brand/BukolabsLogoMark";

type Props = {
  variant?: "light" | "dark";
  compact?: boolean;
  /** Ribbon mark only, no wordmark */
  markOnly?: boolean;
};

export function BrandLogo({ variant = "dark", compact = false, markOnly = false }: Props) {
  if (!markOnly && !compact) {
    return <BukolabsBrand variant="welcome" />;
  }

  if (markOnly) {
    return (
      <BukolabsLogoMark
        className={compact ? "h-10 w-8 object-contain" : "h-[52px] w-[42px] object-contain"}
      />
    );
  }

  return <BukolabsBrand variant="compact" tone={variant === "light" ? "light" : "default"} />;
}
