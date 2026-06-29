import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "606:901";
const SCREEN_NAME = "4. BOND PAPER SIZE OVERLAY";
const ASSET = null;
const FILE_SLUG = "4-bond-paper-size-overlay";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function S4BondPaperSizeOverlayScreen(props: Props) {
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

export default S4BondPaperSizeOverlayScreen;
