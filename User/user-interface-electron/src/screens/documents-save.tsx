import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "425:1253";
const SCREEN_NAME = "DOCUMENTS SAVE";
const ASSET = null;
const FILE_SLUG = "documents-save";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function DocumentsSaveScreen(props: Props) {
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

export default DocumentsSaveScreen;
