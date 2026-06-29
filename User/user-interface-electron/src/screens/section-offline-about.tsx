import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "696:1390";
const SCREEN_NAME = "Section - OFFLINE ABOUT";
const ASSET = null;
const FILE_SLUG = "section-offline-about";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function SectionOfflineAboutScreen(props: Props) {
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

export default SectionOfflineAboutScreen;
