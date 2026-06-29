import { useEffect, useState } from "react";
import { ValidationDescription } from "./ValidationDescription";
import { ValidationHeader } from "./ValidationHeader";
import { ValidationIcon } from "./ValidationIcon";
import { ValidationModalContainer } from "./ValidationModalContainer";
import { ValidationProgressBar } from "./ValidationProgressBar";
import { ValidationStatusText } from "./ValidationStatusText";

const STATUS_MESSAGES = [
  "Checking serial key integrity...",
  "Verifying device registration...",
  "Matching account and device access...",
  "Preparing activation session...",
] as const;

export function ValidatingSerialKeyModal() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [messageVisible, setMessageVisible] = useState(true);
  const [progress, setProgress] = useState(55);

  useEffect(() => {
    const progressTimer = window.setInterval(() => {
      setProgress((current) => (current >= 96 ? current : current + 2.4));
    }, 45);

    return () => window.clearInterval(progressTimer);
  }, []);

  useEffect(() => {
    const rotateTimer = window.setInterval(() => {
      setMessageVisible(false);
      window.setTimeout(() => {
        setMessageIndex((current) => (current + 1) % STATUS_MESSAGES.length);
        setMessageVisible(true);
      }, 250);
    }, 1800);

    return () => window.clearInterval(rotateTimer);
  }, []);

  return (
    <ValidationModalContainer>
      <ValidationIcon />
      <ValidationHeader />
      <ValidationDescription />
      <div className="mt-1 flex w-full flex-col items-center">
        <ValidationProgressBar progress={progress} />
        <ValidationStatusText
          message={STATUS_MESSAGES[messageIndex]}
          visible={messageVisible}
        />
      </div>
    </ValidationModalContainer>
  );
}
