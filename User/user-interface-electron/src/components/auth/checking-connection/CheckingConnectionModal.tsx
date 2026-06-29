import { useEffect, useState } from "react";
import { ConnectionDescription } from "./ConnectionDescription";
import { ConnectionHeader } from "./ConnectionHeader";
import { ConnectionIcon } from "./ConnectionIcon";
import { ConnectionModalContainer } from "./ConnectionModalContainer";
import { ConnectionProgressBar } from "./ConnectionProgressBar";
import { ConnectionStatusText } from "./ConnectionStatusText";

const STATUS_MESSAGES = [
  "Checking network availability...",
  "Connecting to Bukolabs gateway...",
  "Preparing your workspace...",
] as const;

export function CheckingConnectionModal() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [messageVisible, setMessageVisible] = useState(true);
  const [progress, setProgress] = useState(18);

  useEffect(() => {
    const progressTimer = window.setInterval(() => {
      setProgress((current) => (current >= 92 ? 92 : current + 2.5));
    }, 90);

    return () => window.clearInterval(progressTimer);
  }, []);

  useEffect(() => {
    const rotateTimer = window.setInterval(() => {
      setMessageVisible(false);
      window.setTimeout(() => {
        setMessageIndex((current) => (current + 1) % STATUS_MESSAGES.length);
        setMessageVisible(true);
      }, 180);
    }, 1200);

    return () => window.clearInterval(rotateTimer);
  }, []);

  return (
    <ConnectionModalContainer>
      <ConnectionIcon />
      <ConnectionHeader />
      <ConnectionDescription />
      <div className="flex w-full flex-col items-center">
        <ConnectionProgressBar progress={progress} />
        <ConnectionStatusText
          message={STATUS_MESSAGES[messageIndex]}
          visible={messageVisible}
        />
      </div>
    </ConnectionModalContainer>
  );
}
