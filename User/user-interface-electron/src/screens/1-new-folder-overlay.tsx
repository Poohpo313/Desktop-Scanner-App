import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "619:533";
const SCREEN_NAME = "1. NEW FOLDER OVERLAY";
const ASSET = null;
const FILE_SLUG = "1-new-folder-overlay";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function S1NewFolderOverlayScreen(props: Props) {
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

export default S1NewFolderOverlayScreen;
