import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "740:1908";
const SCREEN_NAME = "OFFLINE LOCAL SAVE FOLDER";
const ASSET = null;
const FILE_SLUG = "offline-local-save-folder";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function OfflineLocalSaveFolderScreen(props: Props) {
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

export default OfflineLocalSaveFolderScreen;
