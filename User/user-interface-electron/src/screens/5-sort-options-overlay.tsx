import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "619:671";
const SCREEN_NAME = "5. SORT OPTIONS OVERLAY";
const ASSET = null;
const FILE_SLUG = "5-sort-options-overlay";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function S5SortOptionsOverlayScreen(props: Props) {
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

export default S5SortOptionsOverlayScreen;
