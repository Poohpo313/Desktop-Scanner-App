import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "619:638";
const SCREEN_NAME = "4. FILE TYPE FILTER OVERLAY";
const ASSET = null;
const FILE_SLUG = "4-file-type-filter-overlay";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function S4FileTypeFilterOverlayScreen(props: Props) {
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

export default S4FileTypeFilterOverlayScreen;
