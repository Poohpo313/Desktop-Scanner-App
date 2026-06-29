import { ReactNode } from "react";
import { getFigmaScreen } from "../figma/figmaScreenCatalog";
import { FigmaScreenView } from "./FigmaScreenView";
import "../styles/figma-screen.css";

type Props = {
  slug: string;
  variant?: "full" | "inShell";
  className?: string;
  children?: ReactNode;
};

export function FigmaUserScreen({
  slug,
  variant = "full",
  className = "",
  children,
}: Props) {
  const meta = getFigmaScreen(slug);

  if (!meta) {
    return (
      <div className={className} data-screen={slug}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={`figma-screen ${variant === "inShell" ? "figma-screen--in-shell" : ""} ${className}`.trim()}
      data-screen={slug}
      data-figma-id={meta.figmaId}
    >
      <FigmaScreenView meta={meta} variant={variant} />
      {children ? <div className="figma-screen__overlay">{children}</div> : null}
    </div>
  );
}
