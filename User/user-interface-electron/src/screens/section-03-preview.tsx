import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "398:956";
const SCREEN_NAME = "Section - 03 Preview";
const ASSET = "/figma-assets/Section - 03 Preview.png";
const FILE_SLUG = "section-03-preview";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function Section03PreviewScreen(props: Props) {
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

export default Section03PreviewScreen;
