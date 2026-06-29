import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "696:859";
const SCREEN_NAME = "Section - OFFLINE DASHBOARD";
const ASSET = null;
const FILE_SLUG = "section-offline-dashboard";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function SectionOfflineDashboardScreen(props: Props) {
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

export default SectionOfflineDashboardScreen;
