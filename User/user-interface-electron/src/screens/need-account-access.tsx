import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "1230:902";
const SCREEN_NAME = "NEED ACCOUNT ACCESS?";
const ASSET = null;
const FILE_SLUG = "need-account-access";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function NeedAccountAccessScreen(props: Props) {
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

export default NeedAccountAccessScreen;
