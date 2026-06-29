import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "732:850";
const SCREEN_NAME = "Section - SCREEN 1: SELECT SCANNER OFFLINE";
const ASSET = null;
const FILE_SLUG = "section-screen-1-select-scanner-offline";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function SectionScreen1SelectScannerOfflineScreen(props: Props) {
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

export default SectionScreen1SelectScannerOfflineScreen;
