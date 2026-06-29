import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "1193:1062";
const SCREEN_NAME = "NO INTERNET CONNECTION";
const ASSET = "/figma-assets/NO INTERNET CONNECTION.png";
const FILE_SLUG = "no-internet-connection";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function NoInternetConnectionScreen(props: Props) {
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

export default NoInternetConnectionScreen;
