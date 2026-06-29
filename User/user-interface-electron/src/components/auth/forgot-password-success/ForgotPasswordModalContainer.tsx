import type { CSSProperties, ReactNode } from "react";

type ForgotPasswordModalContainerProps = {
  children: ReactNode;
};

const SURFACE: CSSProperties = {
  background:
    "radial-gradient(164.31% 126.03% at 100% 0%, rgba(31, 62, 154, 0.08) 0%, rgba(31, 62, 154, 0) 34%), linear-gradient(180deg, #F8FAFF 0%, #F1F5FB 100%)",
  boxShadow:
    "0 34px 90px rgba(0,0,0,0.36), inset 0 1px 0 1px rgba(255,255,255,0.82)",
};

export function ForgotPasswordModalContainer({ children }: ForgotPasswordModalContainerProps) {
  return (
    <div
      className="relative box-border flex h-[430px] min-h-[430px] w-[560px] max-w-full flex-col items-center rounded-[28px] border border-[rgba(226,232,240,0.95)] px-[46px] pb-10 pt-11 auth-modal--success-enter"
      style={SURFACE}
      data-screen="request-sent-for-forgot-password-successfully"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-password-success-title"
    >
      {children}
    </div>
  );
}
