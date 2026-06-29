import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "1230:887";
const SCREEN_NAME = "REQUEST THROUGH EMAIL";
const ASSET = null;
const FILE_SLUG = "request-through-email";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function RequestThroughEmailScreen(props: Props) {
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

export default RequestThroughEmailScreen;
