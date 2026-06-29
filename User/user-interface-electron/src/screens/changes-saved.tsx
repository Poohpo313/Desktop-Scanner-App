import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "370:586";
const SCREEN_NAME = "CHANGES SAVED";
const ASSET = null;
const FILE_SLUG = "changes-saved";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function ChangesSavedScreen(props: Props) {
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

export default ChangesSavedScreen;
