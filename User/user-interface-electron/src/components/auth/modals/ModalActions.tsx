import type { ReactNode } from "react";

type ModalActionsProps = {
  children: ReactNode;
};

export function ModalActions({ children }: ModalActionsProps) {
  return (
    <div className="mt-auto flex w-full items-center justify-center gap-3">
      {children}
    </div>
  );
}
