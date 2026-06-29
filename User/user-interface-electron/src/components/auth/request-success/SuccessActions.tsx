import type { ReactNode } from "react";

type SuccessActionsProps = {
  children: ReactNode;
};

export function SuccessActions({ children }: SuccessActionsProps) {
  return (
    <div className="mt-auto flex w-full items-center justify-center pt-10">
      {children}
    </div>
  );
}
