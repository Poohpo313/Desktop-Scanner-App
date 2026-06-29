import type { ReactNode } from "react";

type OfflineActionsProps = {
  children: ReactNode;
};

export function OfflineActions({ children }: OfflineActionsProps) {
  return (
    <div className="mt-6 flex w-full items-center justify-center gap-3.5">{children}</div>
  );
}
