import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "212:367";
const SCREEN_NAME = "Section  - Account Menu";
const ASSET = "/figma-assets/Section  - Account Menu.png";
const FILE_SLUG = "section-account-menu";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function SectionAccountMenuScreen(props: Props) {
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

export default SectionAccountMenuScreen;
