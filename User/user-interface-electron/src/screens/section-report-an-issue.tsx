import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "366:487";
const SCREEN_NAME = "Section - Report an Issue";
const ASSET = null;
const FILE_SLUG = "section-report-an-issue";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function SectionReportAnIssueScreen(props: Props) {
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

export default SectionReportAnIssueScreen;
