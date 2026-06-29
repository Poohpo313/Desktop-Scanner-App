import { BackToSignInButton } from "./BackToSignInButton";
import { ForgotPasswordModalContainer } from "./ForgotPasswordModalContainer";
import { SuccessActions } from "./SuccessActions";
import { SuccessDescription } from "./SuccessDescription";
import { SuccessHeader } from "./SuccessHeader";
import { SuccessIcon } from "./SuccessIcon";

export function ForgotPasswordSuccessModal() {
  return (
    <ForgotPasswordModalContainer>
      <div className="flex w-full flex-col items-center">
        <SuccessIcon />
        <SuccessHeader />
        <SuccessDescription />
      </div>

      <SuccessActions>
        <BackToSignInButton />
      </SuccessActions>
    </ForgotPasswordModalContainer>
  );
}
