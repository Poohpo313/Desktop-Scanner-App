import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "366:426";
const SCREEN_NAME = "Section - Send Feedback";
const ASSET = null;
const FILE_SLUG = "section-send-feedback";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function SectionSendFeedbackScreen(props: Props) {
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

export default SectionSendFeedbackScreen;
