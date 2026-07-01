import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AdminContactDescription,
  ContinueButton,
  ModalActions,
  ModalContainer,
} from "../modals";
import { appendAdminContactHint } from "../adminSupportCopy";
import { useAdminSupportContact } from "../../../hooks/useAdminSupportContact";
import { requestSupportCloseTarget, requestSupportContinueTarget } from "../../../lib/authReturnRoutes";
import { CloseButton } from "../need-account-access/CloseButton";
import { SMSIconHeader } from "./SMSIconHeader";

type RequestSMSModalProps = {
  context?: string;
};

export function RequestSMSModal({ context = "activation" }: RequestSMSModalProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const username = searchParams.get("username")?.trim() || undefined;
  const serialKey = searchParams.get("serialKey")?.trim() || undefined;
  const { contact, loading } = useAdminSupportContact({ username, serialKey });

  const closeTo = requestSupportCloseTarget(context, { username, serialKey });
  const returnTo = requestSupportContinueTarget(context);

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
      <CloseButton fallbackTo={closeTo} />
      <SMSIconHeader />

      <h1 className="m-0 text-center font-sans text-[32px] font-semibold leading-[1.15] tracking-[-1px] text-[#0F172A] sm:text-[42px]">
        Request Through SMS
      </h1>

      <AdminContactDescription
        text={loading ? "Loading administrator contact..." : description}
        highlight={contact?.phoneNumber}
      />

      <ModalActions>
        <ContinueButton onClick={() => navigate(returnTo)} />
      </ModalActions>
    </ModalContainer>
  );
}
