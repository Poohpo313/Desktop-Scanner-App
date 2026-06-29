import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "696:1067";
const SCREEN_NAME = "Section - OFFLINE SEARCH";
const ASSET = null;
const FILE_SLUG = "section-offline-search";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function SectionOfflineSearchScreen(props: Props) {
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

export default SectionOfflineSearchScreen;
