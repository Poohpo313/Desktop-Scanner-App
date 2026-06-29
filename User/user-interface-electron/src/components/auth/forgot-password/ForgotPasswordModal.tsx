import { CircleHelp } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { forgotPasswordCloseTarget } from "../../../lib/authReturnRoutes";
import { CloseButton } from "../need-account-access/CloseButton";
import { ForgotPasswordOptionsList } from "./ForgotPasswordOptionsList";

export function ForgotPasswordModal() {
  const [searchParams] = useSearchParams();
  const username = searchParams.get("username")?.trim() || undefined;

  return (
    <div
      className="relative box-border flex w-[560px] max-w-full flex-col items-center gap-[15px] rounded-[28px] border border-[rgba(226,232,240,0.95)] px-[46px] pb-10 pt-11 max-h-[calc(100vh-64px)] overflow-y-auto auth-modal--enter"
      style={{
        minHeight: 430,
        background:
          "radial-gradient(134.73% 149.22% at 100% 0%, rgba(31, 62, 154, 0.08) 0%, rgba(31, 62, 154, 0.00) 34%), linear-gradient(180deg, #F8FAFF 0%, #F1F5FB 100%)",
        boxShadow:
          "0 34px 90px rgba(0,0,0,0.36), inset 0 1px 0 1px rgba(255,255,255,0.82)",
      }}
      data-screen="forgot-password"
    >
      <CloseButton fallbackTo={forgotPasswordCloseTarget(username)} />

      <div
        className="mb-2 mt-2 flex h-14 w-14 items-center justify-center rounded-[18px] border border-[rgba(0,135,104,0.15)] bg-[linear-gradient(180deg,#DDF0ED_0%,#CFE7E3_100%)]"
        aria-hidden="true"
      >
        <CircleHelp className="h-7 w-7 text-[#0B5F58]" strokeWidth={1.8} />
      </div>

      <h1 className="m-0 text-center font-sans text-[28px] font-semibold leading-[1.2] text-[#0F172A] sm:text-[38px]">
        Forgot Password?
      </h1>

      <p className="m-0 max-w-[420px] text-center font-sans text-[15px] font-normal leading-[1.7] text-[#64748B]">
        For security, password assistance is handled by your administrator. Choose how you want to
        contact the admin to verify your account.
      </p>

      <ForgotPasswordOptionsList />
    </div>
  );
}
