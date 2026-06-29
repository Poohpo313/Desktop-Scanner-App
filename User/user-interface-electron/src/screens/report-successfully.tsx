import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "797:902";
const SCREEN_NAME = "REPORT SUCCESSFULLY";
const ASSET = null;
const FILE_SLUG = "report-successfully";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function ReportSuccessfullyScreen(props: Props) {
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

export default ReportSuccessfullyScreen;
