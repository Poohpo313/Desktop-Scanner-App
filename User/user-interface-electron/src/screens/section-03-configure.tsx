import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "601:526";
const SCREEN_NAME = "Section 03 - Configure";
const ASSET = "/figma-assets/Section 03 - Configure.png";
const FILE_SLUG = "section-03-configure";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function Section03ConfigureScreen(props: Props) {
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

export default Section03ConfigureScreen;
