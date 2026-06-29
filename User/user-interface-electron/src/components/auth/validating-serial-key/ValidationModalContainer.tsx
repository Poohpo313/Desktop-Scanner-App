import type { CSSProperties, ReactNode } from "react";

type ValidationModalContainerProps = {
  children: ReactNode;
  dataScreen?: string;
};

const SURFACE: CSSProperties = {
  background:
    "radial-gradient(171.32% 123.16% at 100% 0%, rgba(31, 62, 154, 0.08) 0%, rgba(31, 62, 154, 0) 34%), linear-gradient(180deg, #F8FAFF 0%, #F1F5FB 100%)",
  boxShadow:
    "0 34px 90px rgba(0,0,0,0.36), inset 0 1px 0 1px rgba(255,255,255,0.82)",
};

export function ValidationModalContainer({
  children,
  dataScreen = "validating-serial-key",
}: ValidationModalContainerProps) {
  return (
    <div
      className="relative box-border flex h-[360px] min-h-[360px] w-[500px] max-w-full flex-col items-center gap-3.5 rounded-[28px] border border-[rgba(226,232,240,0.95)] px-[46px] pb-10 pt-11 auth-modal--success-enter"
      style={SURFACE}
      data-screen={dataScreen}
      role="dialog"
      aria-modal="true"
      aria-labelledby="validating-serial-key-title"
      aria-busy="true"
    >
      {children}
    </div>
  );
}
