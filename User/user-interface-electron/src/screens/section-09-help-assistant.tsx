import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "38:1565";
const SCREEN_NAME = "Section - 09 Help Assistant";
const ASSET = "/figma-assets/Section - 09 Help Assistant.png";
const FILE_SLUG = "section-09-help-assistant";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function Section09HelpAssistantScreen(props: Props) {
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

export default Section09HelpAssistantScreen;
