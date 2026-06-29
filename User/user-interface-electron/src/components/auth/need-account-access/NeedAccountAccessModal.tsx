import { AccessOptionsList } from "./AccessOptionsList";
import { CloseButton } from "./CloseButton";
import { ModalFooterInfo } from "./ModalFooterInfo";
import { ModalHeader } from "./ModalHeader";

type NeedAccountAccessModalProps = {
  closeFallbackTo?: string;
};

export function NeedAccountAccessModal({
  closeFallbackTo = "/activate",
}: NeedAccountAccessModalProps) {
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
      data-screen="need-account-access"
    >
      <CloseButton fallbackTo={closeFallbackTo} />

      <ModalHeader />

      <h1 className="m-0 text-center font-sans text-[28px] font-semibold leading-[1.2] text-[#0F172A] sm:text-[38px]">
        Need Account Access?
      </h1>

      <p className="m-0 max-w-[420px] text-center font-sans text-[15px] font-normal leading-[1.7] text-[#64748B]">
        Your username and serial key are assigned by your Administrator. Choose how you want to
        request or receive your access details.
      </p>

      <AccessOptionsList />

      <ModalFooterInfo />
    </div>
  );
}
