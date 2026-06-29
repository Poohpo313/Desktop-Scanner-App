import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "370:573";
const SCREEN_NAME = "SAVED";
const ASSET = null;
const FILE_SLUG = "saved";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function SavedScreen(props: Props) {
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

export default SavedScreen;
