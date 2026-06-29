import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import flow from "../flow.json";
import "../styles/flow-nav.css";

const PRODUCTION_ROUTES: Record<string, string> = {
  "splash-screen": "/portal/login",
  "administrator-pin": "/portal/login",
  "super-admin-dashboadr-section": "/portal/dashboard",
  "register-admin": "/portal/admins",
  "register-user": "/portal/users",
  "super-admin-key": "/portal/keys",
  "super-admin-device-management": "/portal/users",
  "super-admin-cloud": "/portal/cloud",
  "backup-management": "/portal/logs",
  "super-admin-logs": "/portal/logs",
  "super-admin-settings": "/portal/settings",
  "super-admin-help": "/portal/help",
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

  useEffect(() => {
    document.body.classList.add("has-flow-nav");
    return () => document.body.classList.remove("has-flow-nav");
  }, []);

  if (!node) return null;

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
        <button className="flow-nav__btn flow-nav__btn--secondary" type="button" onClick={() => navigate("/all-screens")}>
          All Screens
        </button>
      </div>
    </nav>
  );
}
