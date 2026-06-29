import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "38:928";
const SCREEN_NAME = "Section - 05 Search";
const ASSET = "/figma-assets/Section - 05 Search.png";
const FILE_SLUG = "section-05-search";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function Section05SearchScreen(props: Props) {
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

export default Section05SearchScreen;
