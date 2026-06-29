import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AdminContactDescription,
  ContinueButton,
  ModalActions,
  ModalContainer,
} from "../modals";
import { appendAdminContactHint } from "../adminSupportCopy";
import { useAdminSupportContact } from "../../../hooks/useAdminSupportContact";
import { SMSIconHeader } from "./SMSIconHeader";

type RequestSMSModalProps = {
  context?: string;
};

export function RequestSMSModal({ context = "activation" }: RequestSMSModalProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const username = searchParams.get("username")?.trim() || undefined;
  const serialKey = searchParams.get("serialKey")?.trim() || undefined;
  const { contact } = useAdminSupportContact({ username, serialKey });

  const returnTo =
    context === "forgot"
      ? username
        ? `/forgot?username=${encodeURIComponent(username)}`
        : "/forgot"
      : (() => {
          const params = new URLSearchParams();
          if (username) params.set("username", username);
          if (serialKey) params.set("serialKey", serialKey);
          const suffix = params.toString() ? `?${params.toString()}` : "";
          return `/need-account-access${suffix}`;
        })();

  const isForgot = context === "forgot";
  const description = appendAdminContactHint(
    isForgot
      ? "Contact your administrator by SMS to verify your account and get help resetting your password."
      : "Contact your administrator by SMS to receive your assigned username and serial key.",
    contact,
    "sms",
  );

  return (
    <ModalContainer dataScreen="request-through-sms">
      <SMSIconHeader />

      <h1 className="m-0 text-center font-sans text-[32px] font-semibold leading-[1.15] tracking-[-1px] text-[#0F172A] sm:text-[42px]">
        Request Through SMS
      </h1>

      <AdminContactDescription text={description} highlight={contact?.phoneNumber} />

      <ModalActions>
        <ContinueButton onClick={() => navigate(returnTo)} />
      </ModalActions>
    </ModalContainer>
  );
}
