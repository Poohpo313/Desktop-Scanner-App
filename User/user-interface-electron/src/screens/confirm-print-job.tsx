import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "1316:885";
const SCREEN_NAME = "Confirm Print Job";
const ASSET = null;
const FILE_SLUG = "confirm-print-job";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function ConfirmPrintJobScreen(props: Props) {
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

export default ConfirmPrintJobScreen;
