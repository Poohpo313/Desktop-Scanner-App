import { ReactNode } from "react";
import { BukolabsLogoMark } from "../brand/BukolabsLogoMark";
import { AuthPageShell } from "./AuthPageShell";
import "../../styles/auth-flow.css";

type Kind = "checking" | "validating" | "connection" | "success" | "offline";

const COPY: Record<Kind, { title: string; subtitle: string; screenSlug: string }> = {
  checking: {
    title: "Checking credentials",
    subtitle: "Verifying your assigned account…",
    screenSlug: "checking-credentials",
  },
  validating: {
    title: "Validating serial key",
    subtitle: "Activating your workspace access…",
    screenSlug: "validating-serial-key",
  },
  connection: {
    title: "Checking connection",
    subtitle: "Confirming network availability…",
    screenSlug: "checking-connection",
  },
  success: {
    title: "Account activated",
    subtitle: "Your workspace is ready. Sign in to continue.",
    screenSlug: "account-activated",
  },
  offline: {
    title: "No internet connection",
    subtitle: "You can continue in offline mode.",
    screenSlug: "no-internet-connection",
  },
};

type Props = {
  kind: Kind;
  children?: ReactNode;
};

export function AuthFlowScreen({ kind, children }: Props) {
  const { title, subtitle, screenSlug } = COPY[kind];
  const isSuccess = kind === "success";

  return (
    <AuthPageShell screenSlug={screenSlug}>
      <div className="auth-flow__aside" aria-hidden="true" />
      <div className="auth-flow__main">
        <div className={`auth-flow__card${isSuccess ? " auth-flow__card--success" : ""}`}>
          <BukolabsLogoMark className="auth-flow__logo" />
          {!isSuccess ? (
            <div className="auth-flow__spinner" aria-hidden="true" />
          ) : (
            <div className="auth-flow__check" aria-hidden="true">✓</div>
          )}
          <h1 className="auth-flow__title">{title}</h1>
          <p className="auth-flow__subtitle">{subtitle}</p>
          {children ? <div className="auth-flow__actions">{children}</div> : null}
        </div>
      </div>
    </AuthPageShell>
  );
}
