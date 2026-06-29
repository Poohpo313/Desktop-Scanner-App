import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "38:1255";
const SCREEN_NAME = "Section - 07 Settings";
const ASSET = "/figma-assets/Section - 07 Settings.png";
const FILE_SLUG = "section-07-settings";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function Section07SettingsScreen(props: Props) {
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

export default Section07SettingsScreen;
