import { useState } from "react";
import type { FigmaScreenMeta } from "../figma/figmaScreenCatalog";
import "../styles/figma-screen.css";

type Props = {
  meta: FigmaScreenMeta;
  variant?: "full" | "inShell";
  className?: string;
};

export function FigmaScreenView({ meta, variant = "full", className = "" }: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const useEmbed = !meta.asset || imgFailed;

  return (
    <div
      className={`figma-screen__viewport ${variant === "inShell" ? "figma-screen__viewport--in-shell" : ""}`}
    >
      {useEmbed ? (
        <iframe
          className={`figma-screen__embed ${variant === "inShell" ? "figma-screen__embed--in-shell" : ""}`}
          title={meta.name}
          src={meta.embedUrl}
          allowFullScreen
        />
      ) : (
        <img
          className={`figma-screen__img ${variant === "inShell" ? "figma-screen__img--in-shell" : ""}`}
          src={meta.asset!}
          alt={meta.name}
          onError={() => setImgFailed(true)}
        />
      )}
    </div>
  );
}
