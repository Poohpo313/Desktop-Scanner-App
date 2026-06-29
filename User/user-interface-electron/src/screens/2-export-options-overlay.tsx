import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "619:567";
const SCREEN_NAME = "2. EXPORT OPTIONS OVERLAY";
const ASSET = null;
const FILE_SLUG = "2-export-options-overlay";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function S2ExportOptionsOverlayScreen(props: Props) {
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

export default S2ExportOptionsOverlayScreen;
