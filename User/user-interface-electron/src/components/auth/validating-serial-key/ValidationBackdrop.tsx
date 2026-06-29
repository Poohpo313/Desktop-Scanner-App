import type { ReactNode } from "react";

type ValidationBackdropProps = {
  children: ReactNode;
};

export function ValidationBackdrop({ children }: ValidationBackdropProps) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[rgba(15,23,42,0.45)] p-5 backdrop-blur-[8px]">
      {children}
    </div>
  );
}
