import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "606:963";
const SCREEN_NAME = "6. COLOR MODE OVERLAY";
const ASSET = null;
const FILE_SLUG = "6-color-mode-overlay";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function S6ColorModeOverlayScreen(props: Props) {
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

export default S6ColorModeOverlayScreen;
