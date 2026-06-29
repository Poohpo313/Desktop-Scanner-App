import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "619:736";
const SCREEN_NAME = "7. MOVE TO FOLDER OVERLAY";
const ASSET = null;
const FILE_SLUG = "7-move-to-folder-overlay";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function S7MoveToFolderOverlayScreen(props: Props) {
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

export default S7MoveToFolderOverlayScreen;
