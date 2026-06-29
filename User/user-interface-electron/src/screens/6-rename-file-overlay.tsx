import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "619:705";
const SCREEN_NAME = "6. RENAME FILE OVERLAY";
const ASSET = null;
const FILE_SLUG = "6-rename-file-overlay";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function S6RenameFileOverlayScreen(props: Props) {
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

export default S6RenameFileOverlayScreen;
