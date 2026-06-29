import type { ReactNode } from "react";
import "../../../styles/offline-screen.css";

type OfflineBackgroundProps = {
  children: ReactNode;
};

export function OfflineBackground({ children }: OfflineBackgroundProps) {
  return (
    <div className="offline-screen" data-screen="no-internet-connection">
      <div className="offline-screen__shape offline-screen__shape--left" aria-hidden="true" />
      <div className="offline-screen__shape offline-screen__shape--right" aria-hidden="true" />
      {children}
    </div>
  );
}
