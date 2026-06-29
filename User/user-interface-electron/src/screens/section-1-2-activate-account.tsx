import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "1192:850";
const SCREEN_NAME = "Section - 1.2 Activate Account";
const ASSET = "/figma-assets/Section - 1.2 Activate Account.png";
const FILE_SLUG = "section-1-2-activate-account";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function Section12ActivateAccountScreen(props: Props) {
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

export default Section12ActivateAccountScreen;
