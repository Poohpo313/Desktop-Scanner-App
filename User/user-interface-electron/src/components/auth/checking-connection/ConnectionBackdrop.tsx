import type { ReactNode } from "react";

type ConnectionBackdropProps = {
  children: ReactNode;
};

export function ConnectionBackdrop({ children }: ConnectionBackdropProps) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[rgba(15,23,42,0.45)] p-5 backdrop-blur-[8px]">
      {children}
    </div>
  );
}
