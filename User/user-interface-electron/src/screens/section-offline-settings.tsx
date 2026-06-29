import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "696:1275";
const SCREEN_NAME = "Section - OFFLINE SETTINGS";
const ASSET = null;
const FILE_SLUG = "section-offline-settings";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function SectionOfflineSettingsScreen(props: Props) {
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

export default SectionOfflineSettingsScreen;
