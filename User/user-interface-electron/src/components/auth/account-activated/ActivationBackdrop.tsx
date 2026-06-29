import type { ReactNode } from "react";

type ActivationBackdropProps = {
  children: ReactNode;
};

export function ActivationBackdrop({ children }: ActivationBackdropProps) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[rgba(15,23,42,0.45)] p-5 backdrop-blur-[8px]">
      <p className="pointer-events-none absolute left-8 top-8 m-0 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-[#94A3B8]">
        Account Activated
      </p>
      {children}
    </div>
  );
}
