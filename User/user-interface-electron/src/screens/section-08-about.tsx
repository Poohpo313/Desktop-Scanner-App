import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "38:1430";
const SCREEN_NAME = "Section - 08 About";
const ASSET = "/figma-assets/Section - 08 About.png";
const FILE_SLUG = "section-08-about";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function Section08AboutScreen(props: Props) {
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

export default Section08AboutScreen;
