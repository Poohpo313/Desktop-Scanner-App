import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "271:668";
const SCREEN_NAME = "Section - Available Devices";
const ASSET = null;
const FILE_SLUG = "section-available-devices";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function SectionAvailableDevicesScreen(props: Props) {
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

export default SectionAvailableDevicesScreen;
