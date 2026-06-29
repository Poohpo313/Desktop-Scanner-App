import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "38:404";
const SCREEN_NAME = "Section - 03 Scan";
const ASSET = "/figma-assets/Section - 03 Scan.png";
const FILE_SLUG = "section-03-scan";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function Section03ScanScreen(props: Props) {
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

export default Section03ScanScreen;
