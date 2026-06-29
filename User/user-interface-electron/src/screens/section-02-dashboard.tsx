import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "38:168";
const SCREEN_NAME = "Section - 02 Dashboard";
const ASSET = "/figma-assets/Section - 02 Dashboard.png";
const FILE_SLUG = "section-02-dashboard";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function Section02DashboardScreen(props: Props) {
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

export default Section02DashboardScreen;
