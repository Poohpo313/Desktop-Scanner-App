import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "619:605";
const SCREEN_NAME = "3. DEPARTMENT FILTER OVERLAY";
const ASSET = null;
const FILE_SLUG = "3-department-filter-overlay";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function S3DepartmentFilterOverlayScreen(props: Props) {
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

export default S3DepartmentFilterOverlayScreen;
