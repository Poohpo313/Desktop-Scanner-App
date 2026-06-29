import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "1230:872";
const SCREEN_NAME = "REQUEST THROUGH SMS";
const ASSET = null;
const FILE_SLUG = "request-through-sms";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function RequestThroughSmsScreen(props: Props) {
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

export default RequestThroughSmsScreen;
