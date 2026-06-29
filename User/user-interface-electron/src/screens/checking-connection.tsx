import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "1194:1123";
const SCREEN_NAME = "CHECKING CONNECTION";
const ASSET = null;
const FILE_SLUG = "checking-connection";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function CheckingConnectionScreen(props: Props) {
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

export default CheckingConnectionScreen;
