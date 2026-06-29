import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "38:667";
const SCREEN_NAME = "Section - 04 Documents";
const ASSET = "/figma-assets/Section - 04 Documents.png";
const FILE_SLUG = "section-04-documents";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function Section04DocumentsScreen(props: Props) {
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

export default Section04DocumentsScreen;
