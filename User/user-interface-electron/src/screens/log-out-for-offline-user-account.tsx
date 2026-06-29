import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "771:546";
const SCREEN_NAME = "LOG OUT FOR OFFLINE USER ACCOUNT";
const ASSET = null;
const FILE_SLUG = "log-out-for-offline-user-account";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function LogOutForOfflineUserAccountScreen(props: Props) {
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

export default LogOutForOfflineUserAccountScreen;
