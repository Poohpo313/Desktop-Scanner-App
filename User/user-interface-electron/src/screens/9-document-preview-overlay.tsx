import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "619:843";
const SCREEN_NAME = "9. DOCUMENT PREVIEW OVERLAY";
const ASSET = null;
const FILE_SLUG = "9-document-preview-overlay";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function S9DocumentPreviewOverlayScreen(props: Props) {
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

export default S9DocumentPreviewOverlayScreen;
