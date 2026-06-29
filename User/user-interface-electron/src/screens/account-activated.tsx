import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "1194:1106";
const SCREEN_NAME = "ACCOUNT ACTIVATED";
const ASSET = null;
const FILE_SLUG = "account-activated";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function AccountActivatedScreen(props: Props) {
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

export default AccountActivatedScreen;
