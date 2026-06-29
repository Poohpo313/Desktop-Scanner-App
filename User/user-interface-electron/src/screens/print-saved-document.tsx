import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "1316:842";
const SCREEN_NAME = "PRINT SAVED DOCUMENT";
const ASSET = null;
const FILE_SLUG = "print-saved-document";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function PrintSavedDocumentScreen(props: Props) {
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

export default PrintSavedDocumentScreen;
