import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "38:1713";
const SCREEN_NAME = "Section - 10 Save Preferences";
const ASSET = "/figma-assets/Section - 10 Save Preferences.png";
const FILE_SLUG = "section-10-save-preferences";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function Section10SavePreferencesScreen(props: Props) {
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

export default Section10SavePreferencesScreen;
