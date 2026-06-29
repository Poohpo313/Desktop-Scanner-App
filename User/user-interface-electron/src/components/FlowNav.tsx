import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import flow from "../flow.json";
import "../styles/flow-nav.css";

type FlowNode = {
  title?: string;
  next?: string;
  decision?: {
    prompt: string;
    options: Array<{ label: string; next: string }>;
  };
};

const PRODUCTION_ROUTES: Record<string, string> = {
  "002-splash-screen": "/",
  "welcome-screen": "/welcome",
  "section-1-1-returning-user-login": "/login",
  "forgot-password": "/forgot",
  "request-through-email": "/request-email",
  "request-through-sms": "/request-sms",
  "request-sent-for-forgot-password-successfully": "/request-sent?context=forgot",
  "request-sent-successfully": "/request-sent",
  "need-account-access": "/need-account-access",
  "section-1-2-activate-account": "/activate",
  "validating-serial-key": "/validating-key",
  "account-activated": "/activated",
  "checking-credentials": "/checking",
  "checking-connection": "/checking-connection",
  "no-internet-connection": "/no-internet",
  "section-02-dashboard": "/dashboard",
  "section-offline-dashboard": "/offline-dashboard",
  "section-03-scan": "/scan",
  "section-04-documents": "/files",
  "section-05-search": "/search",
  "section-07-settings": "/settings",
  "section-08-about": "/help",
};

export function FlowNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const screenId = location.pathname.replace(/^\/figma\//, "") || flow.entry;
  const node = (flow.nodes as Record<string, FlowNode>)[screenId];

  useEffect(() => {
    document.body.classList.add("has-flow-nav");
    return () => document.body.classList.remove("has-flow-nav");
  }, []);

  if (!node) return null;

  const go = (slug: string) => navigate(`/figma/${slug}`);
  const prod = PRODUCTION_ROUTES[screenId];

  return (
    <nav className="flow-nav">
      <div className="flow-nav__title">Flowchart · User Interface</div>
      <div className="flow-nav__step">{node.title || screenId}</div>
      <div className="flow-nav__actions">
        {node.decision ? (
          <>
            <span className="flow-nav__prompt">{node.decision.prompt}</span>
            {node.decision.options.map((option) => (
              <button key={option.next + option.label} className="flow-nav__btn" type="button" onClick={() => go(option.next)}>
                {option.label}
              </button>
            ))}
          </>
        ) : node.next ? (
          <button className="flow-nav__btn" type="button" onClick={() => go(node.next!)}>
            Continue →
          </button>
        ) : null}
        {prod && (
          <button className="flow-nav__btn flow-nav__btn--secondary" type="button" onClick={() => navigate(prod)}>
            Open production screen
          </button>
        )}
        <button className="flow-nav__btn flow-nav__btn--secondary" type="button" onClick={() => navigate("/welcome")}>
          Welcome
        </button>
        <button className="flow-nav__btn flow-nav__btn--secondary" type="button" onClick={() => go(flow.dashboard)}>
          Dashboard
        </button>
        <button className="flow-nav__btn flow-nav__btn--secondary" type="button" onClick={() => navigate("/figma/gallery")}>
          All screens
        </button>
      </div>
    </nav>
  );
}
