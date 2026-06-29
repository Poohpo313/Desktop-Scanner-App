import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "606:998";
const SCREEN_NAME = "3. BROWSE FOLDER OVERLAY";
const ASSET = null;
const FILE_SLUG = "3-browse-folder-overlay";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function S3BrowseFolderOverlayScreen(props: Props) {
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

export default S3BrowseFolderOverlayScreen;
