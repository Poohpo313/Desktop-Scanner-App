import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "38:4";
const SCREEN_NAME = "002- Splash Screen";
const ASSET = "/figma-assets/002- Splash Screen.png";
const FILE_SLUG = "002-splash-screen";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function S002SplashScreenScreen(props: Props) {
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

export default S002SplashScreenScreen;
