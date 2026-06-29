import { ComponentProps } from "react";
import { FigmaScreen } from "../components/FigmaScreen";

const FIGMA_ID = "1194:1090";
const SCREEN_NAME = "VALIDATING SERIAL KEY";
const ASSET = null;
const FILE_SLUG = "validating-serial-key";

type Props = Partial<ComponentProps<typeof FigmaScreen>>;

export function ValidatingSerialKeyScreen(props: Props) {
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

export default ValidatingSerialKeyScreen;
