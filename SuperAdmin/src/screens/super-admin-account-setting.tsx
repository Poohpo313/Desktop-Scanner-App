import "../styles/figma-screen.css";
import { FlowNav } from "../components/FlowNav";

const ASSET = null;
const FIGMA_ID = "1364:2522";
const SCREEN_NAME = "Super Admin Account Setting";

export function SuperAdminAccountSettingScreen() {
  const nodeId = FIGMA_ID.replace(":", "-");
  return (
    <main className="figma-screen" data-figma-id={FIGMA_ID} data-screen={"super-admin-account-setting"}>
      <div className="figma-screen__viewport">
        {ASSET ? (
          <img className="figma-screen__img" src={ASSET} alt={SCREEN_NAME} />
        ) : (
          <iframe
            className="figma-screen__embed"
            title={SCREEN_NAME}
            src={`https://embed.figma.com/design/IlPkS1UqnhECqi8qIIJyIb/DESKTOP-SCANNER-TEAM-BISU?node-id=${nodeId}&embed-host=share`}
            allowFullScreen
          />
        )}
      </div>
      <FlowNav />
    </main>
  );
}

export default SuperAdminAccountSettingScreen;
