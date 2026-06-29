import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "797:801";
const SCREEN_NAME = "EXPORT SUCCESSFULLY";
const ASSET = null;
const FILE_SLUG = "export-successfully";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function ExportSuccessfullyScreen(props: Props) {
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

export default ExportSuccessfullyScreen;
