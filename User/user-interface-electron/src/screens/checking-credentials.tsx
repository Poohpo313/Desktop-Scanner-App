import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "1194:1078";
const SCREEN_NAME = "CHECKING CREDENTIALS";
const ASSET = null;
const FILE_SLUG = "checking-credentials";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function CheckingCredentialsScreen(props: Props) {
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

export default CheckingCredentialsScreen;
