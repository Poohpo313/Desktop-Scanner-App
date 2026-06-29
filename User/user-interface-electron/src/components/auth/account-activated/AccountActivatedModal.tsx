import { useEffect, useState } from "react";
import { AccountActivatedModalContainer } from "./AccountActivatedModalContainer";
import { ActivationProgress } from "./ActivationProgress";
import { ActivationSuccessDescription } from "./ActivationSuccessDescription";
import { ActivationSuccessHeader } from "./ActivationSuccessHeader";
import { ActivationSuccessIcon } from "./ActivationSuccessIcon";

export function AccountActivatedModal() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = window.setTimeout(() => setProgress(100), 120);
    return () => window.clearTimeout(start);
  }, []);

  return (
    <AccountActivatedModalContainer>
      <div className="flex w-full flex-col items-center">
        <ActivationSuccessIcon />
        <ActivationSuccessHeader />
        <ActivationSuccessDescription />
        <ActivationProgress progress={progress} />
      </div>
    </AccountActivatedModalContainer>
  );
}
