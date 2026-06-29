import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "606:1048";
const SCREEN_NAME = "2. PAPER ROUTING / FOLDER ROUTE WITH SUBFOLDERS OVERLAY";
const ASSET = null;
const FILE_SLUG = "2-paper-routing-folder-route-with-subfolders-overlay";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function S2PaperRoutingFolderRouteWithSubfoldersOverlayScreen(props: Props) {
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

export default S2PaperRoutingFolderRouteWithSubfoldersOverlayScreen;
