import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "1817:1195";
const SCREEN_NAME = "REQUEST SENT FOR FORGOT PASSWORD SUCCESSFULLY";
const ASSET = null;
const FILE_SLUG = "request-sent-for-forgot-password-successfully";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function RequestSentForForgotPasswordSuccessfullyScreen(props: Props) {
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

export default RequestSentForForgotPasswordSuccessfullyScreen;
