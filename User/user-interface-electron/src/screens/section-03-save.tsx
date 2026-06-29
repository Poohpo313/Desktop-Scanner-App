import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "398:1102";
const SCREEN_NAME = "Section - 03 Save";
const ASSET = "/figma-assets/Section - 03 Save.png";
const FILE_SLUG = "section-03-save";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function Section03SaveScreen(props: Props) {
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

export default Section03SaveScreen;
