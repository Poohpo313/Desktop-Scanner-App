import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "861:942";
const SCREEN_NAME = "FEEDBACK SUBMITTED";
const ASSET = null;
const FILE_SLUG = "feedback-submitted";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function FeedbackSubmittedScreen(props: Props) {
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

export default FeedbackSubmittedScreen;
