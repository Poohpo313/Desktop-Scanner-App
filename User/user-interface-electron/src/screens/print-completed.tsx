import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "1316:971";
const SCREEN_NAME = "Print Completed";
const ASSET = null;
const FILE_SLUG = "print-completed";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function PrintCompletedScreen(props: Props) {
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

export default PrintCompletedScreen;
