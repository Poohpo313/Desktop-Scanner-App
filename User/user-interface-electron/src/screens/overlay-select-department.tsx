import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "606:831";
const SCREEN_NAME = "OVERLAY SELECT DEPARTMENT";
const ASSET = null;
const FILE_SLUG = "overlay-select-department";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function OverlaySelectDepartmentScreen(props: Props) {
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

export default OverlaySelectDepartmentScreen;
