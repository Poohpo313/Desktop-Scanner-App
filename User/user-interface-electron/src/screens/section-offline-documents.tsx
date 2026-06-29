import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "696:963";
const SCREEN_NAME = "Section - OFFLINE DOCUMENTS";
const ASSET = null;
const FILE_SLUG = "section-offline-documents";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function SectionOfflineDocumentsScreen(props: Props) {
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

export default SectionOfflineDocumentsScreen;
