import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "732:1556";
const SCREEN_NAME = "Section - SCREEN 4: SAVE OFFLINE";
const ASSET = null;
const FILE_SLUG = "section-screen-4-save-offline";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function SectionScreen4SaveOfflineScreen(props: Props) {
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

export default SectionScreen4SaveOfflineScreen;
