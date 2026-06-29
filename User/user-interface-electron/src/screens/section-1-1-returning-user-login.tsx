import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "1802:1270";
const SCREEN_NAME = "Section - 1.1 Returning User Login";
const ASSET = "/figma-assets/Section - 1.1 Returning User Login.png";
const FILE_SLUG = "section-1-1-returning-user-login";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function Section11ReturningUserLoginScreen(props: Props) {
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

export default Section11ReturningUserLoginScreen;
