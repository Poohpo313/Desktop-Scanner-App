import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "696:1171";
const SCREEN_NAME = "Section - OFFLINE DEVICES";
const ASSET = null;
const FILE_SLUG = "section-offline-devices";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function SectionOfflineDevicesScreen(props: Props) {
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

export default SectionOfflineDevicesScreen;
