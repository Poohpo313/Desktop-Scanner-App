import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import flow from "../flow.json";
import "../styles/flow-nav.css";

export const FLOW_NAV_HIDDEN_SCREENS = new Set([
  "admin-login",
  "device-management",
  "provision-device",
  "check-device-status-modal",
  "notify-super-admin-modal",
  "monitor-device-modal",
  "retry-connection-modal",
  "report-issue-modal",
  "settings",
]);

export function shouldShowFlowNav(_screenId: string) {
  return false;
}

const PRODUCTION_ROUTES: Record<string, string> = {
  "admin-login": "/portal/login",
  "admin-dashboard": "/portal/dashboard",
  "user-management": "/portal/users",
  "license-key-management": "/portal/keys",
  "device-management": "/portal/devices",
  "help-and-support-center": "/portal/help",
  settings: "/portal/settings",
};

type FlowNode = {
  title?: string;
  next?: string;
  decision?: {
    prompt: string;
    options: Array<{ label: string; next: string }>;
  };
};

export function FlowNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const screenId = location.pathname.replace(/^\//, "") || flow.entry;
  const node = (flow.nodes as Record<string, FlowNode>)[screenId];
  const visible = shouldShowFlowNav(screenId);

  useEffect(() => {
    if (!visible) return;
    document.body.classList.add("has-flow-nav");
    return () => document.body.classList.remove("has-flow-nav");
  }, [visible]);

  if (!visible || !node) return null;

  const prod = PRODUCTION_ROUTES[screenId];

  return (
    <nav className="flow-nav">
      <div className="flow-nav__title">Flowchart Navigation</div>
      <div className="flow-nav__step">{node.title || screenId}</div>
      <div className="flow-nav__actions">
        {node.decision ? (
          <>
            <span className="flow-nav__prompt">{node.decision.prompt}</span>
            {node.decision.options.map((option) => (
              <button
                key={option.next + option.label}
                className="flow-nav__btn"
                type="button"
                onClick={() => navigate("/" + option.next)}
              >
                {option.label}
              </button>
            ))}
          </>
        ) : node.next ? (
          <button className="flow-nav__btn" type="button" onClick={() => navigate("/" + node.next)}>
            Continue →
          </button>
        ) : null}
        {prod && (
          <button className="flow-nav__btn flow-nav__btn--secondary" type="button" onClick={() => navigate(prod)}>
            Open production screen
          </button>
        )}
        <button className="flow-nav__btn flow-nav__btn--secondary" type="button" onClick={() => navigate("/" + flow.dashboard)}>
          Dashboard
        </button>
      </div>
    </nav>
  );
}
