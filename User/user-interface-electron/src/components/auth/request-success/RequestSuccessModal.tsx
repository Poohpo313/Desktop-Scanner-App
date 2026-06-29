import { ModalContainer } from "../modals/ModalContainer";
import { BackToActivationButton } from "./BackToActivationButton";
import { SuccessActions } from "./SuccessActions";
import { SuccessDescription } from "./SuccessDescription";
import { SuccessHeader } from "./SuccessHeader";
import { SuccessIcon } from "./SuccessIcon";

export function RequestSuccessModal() {
  return (
    <ModalContainer
      dataScreen="request-sent-successfully"
      className="auth-modal--success-enter !gap-0 pb-[40px] pt-[44px]"
    >
      <div className="flex w-full flex-col items-center">
        <SuccessIcon />

        <SuccessHeader>
          Request Sent
          <br />
          Successfully
        </SuccessHeader>

        <SuccessDescription>
          Your request has been prepared. Please wait for your Administrator to provide your
          assigned username and serial key.
        </SuccessDescription>
      </div>

      <SuccessActions>
        <BackToActivationButton to="/activate" label="Back to Activation" />
      </SuccessActions>
    </ModalContainer>
  );
}
