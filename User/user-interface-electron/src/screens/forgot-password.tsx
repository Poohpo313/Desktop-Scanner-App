import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "1192:826";
const SCREEN_NAME = "FORGOT PASSWORD";
const ASSET = null;
const FILE_SLUG = "forgot-password";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function ForgotPasswordScreen(props: Props) {
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

export default ForgotPasswordScreen;
