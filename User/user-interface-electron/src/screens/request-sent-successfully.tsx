import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "1230:860";
const SCREEN_NAME = "REQUEST SENT SUCCESSFULLY";
const ASSET = null;
const FILE_SLUG = "request-sent-successfully";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function RequestSentSuccessfullyScreen(props: Props) {
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

export default RequestSentSuccessfullyScreen;
