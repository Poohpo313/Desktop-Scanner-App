import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "732:1339";
const SCREEN_NAME = "Section - SCREEN 3: PREVIEW OFFLINE";
const ASSET = null;
const FILE_SLUG = "section-screen-3-preview-offline";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function SectionScreen3PreviewOfflineScreen(props: Props) {
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

export default SectionScreen3PreviewOfflineScreen;
