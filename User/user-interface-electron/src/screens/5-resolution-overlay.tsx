import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "606:932";
const SCREEN_NAME = "5. RESOLUTION OVERLAY";
const ASSET = null;
const FILE_SLUG = "5-resolution-overlay";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function S5ResolutionOverlayScreen(props: Props) {
  return (
    <FigmaScreen
      fileSlug={FILE_SLUG}
      figmaId={FIGMA_ID}
      name={SCREEN_NAME}
      asset={ASSET}
      {...props}
    />
  );
}

export default S5ResolutionOverlayScreen;
