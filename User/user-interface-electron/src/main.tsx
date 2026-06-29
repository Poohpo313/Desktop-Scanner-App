import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { AppModeProvider } from "./context/AppModeContext";
import { GatewayStatusProvider } from "./context/GatewayStatusContext";
import { DevicesProvider } from "./context/DevicesContext";
import { DocumentsProvider } from "./context/DocumentsContext";
import { SessionProvider } from "./context/SessionContext";
import { bootstrapAppTheme } from "./lib/appTheme";
import "./index.css";
import "./styles/theme-dark-overrides.css";
import "./styles/connection-lost-modal.css";

bootstrapAppTheme();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <SessionProvider>
        <DocumentsProvider>
          <DevicesProvider>
            <AppModeProvider>
              <GatewayStatusProvider>
                <App />
              </GatewayStatusProvider>
            </AppModeProvider>
          </DevicesProvider>
        </DocumentsProvider>
      </SessionProvider>
    </HashRouter>
  </React.StrictMode>,
);
