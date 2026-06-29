import type { ReactNode } from "react";
import "../../../styles/auth-modals.css";

type OfflineCardProps = {
  children: ReactNode;
};

export function OfflineCard({ children }: OfflineCardProps) {
  return (
    <div
      className="relative z-[2] flex min-h-[360px] w-[540px] max-w-[calc(100vw-40px)] flex-col items-center justify-center rounded-3xl bg-[linear-gradient(180deg,#F6FAF9_0%,#EDF4F2_100%)] px-12 py-10 shadow-[0_40px_90px_rgba(0,0,0,0.35)] auth-modal--success-enter"
      role="dialog"
      aria-modal="true"
      aria-labelledby="offline-connection-title"
    >
      {children}
    </div>
  );
}
