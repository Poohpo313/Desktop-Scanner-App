import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "38:1081";
const SCREEN_NAME = "Section - 06 Devices";
const ASSET = "/figma-assets/Section - 06 Devices.png";
const FILE_SLUG = "section-06-devices";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function Section06DevicesScreen(props: Props) {
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

export default Section06DevicesScreen;
