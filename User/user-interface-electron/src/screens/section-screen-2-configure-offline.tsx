import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "732:1058";
const SCREEN_NAME = "Section - SCREEN 2: CONFIGURE OFFLINE";
const ASSET = null;
const FILE_SLUG = "section-screen-2-configure-offline";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function SectionScreen2ConfigureOfflineScreen(props: Props) {
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

export default SectionScreen2ConfigureOfflineScreen;
