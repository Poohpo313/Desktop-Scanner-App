import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "619:788";
const SCREEN_NAME = "8. PRINT SETTINGS OVERLAY";
const ASSET = null;
const FILE_SLUG = "8-print-settings-overlay";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function S8PrintSettingsOverlayScreen(props: Props) {
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

export default S8PrintSettingsOverlayScreen;
