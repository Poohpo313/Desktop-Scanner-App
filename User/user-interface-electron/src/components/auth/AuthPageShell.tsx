import { ReactNode } from "react";
import { getFigmaScreen } from "../../figma/figmaScreenCatalog";
import { AuthStatusBar } from "./AuthStatusBar";
import { AuthWatermark } from "./AuthWatermark";
import "../../styles/login.css";

type Props = {
  children: ReactNode;
  screenSlug: string;
  className?: string;
  statusBar?: ReactNode;
};

export function AuthPageShell({ children, screenSlug, className = "", statusBar }: Props) {
  const figmaId = getFigmaScreen(screenSlug)?.figmaId;

  return (
    <div
      className={`auth-page ${className}`.trim()}
      data-screen={screenSlug}
      data-figma-id={figmaId}
    >
      <div className="auth-page__container">
        <div className="auth-page__split">
          <AuthWatermark />
          {children}
        </div>
        {statusBar ?? <AuthStatusBar />}
      </div>
    </div>
  );
}
