import { IllustrationPanel } from "../components/welcome/IllustrationPanel";
import { StatusBar } from "../components/welcome/StatusBar";
import { WelcomeBody } from "../components/welcome/WelcomeBody";
import "../styles/welcome.css";

export default function WelcomePage() {
  return (
    <main className="welcome" data-screen="welcome-screen" data-figma-id="1802:1272">
      <div className="welcome__card">
        <div className="welcome__layout">
          <WelcomeBody />
          <IllustrationPanel />
        </div>
        <StatusBar />
      </div>
    </main>
  );
}
