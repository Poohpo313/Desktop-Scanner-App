import { useEffect, useRef, useState } from "react";
import scannerAppIcon from "../icons/desktop-scanner-app-icon.png";
import "../styles/desktop-scanner-splash.css";

type Props = {
  onComplete: () => void;
};

const SPLASH_DURATION_MS = 3400;

function ScannerAppIcon() {
  return <img src={scannerAppIcon} alt="" className="desktop-scanner-splash__icon" aria-hidden="true" draggable={false} />;
}

export default function DesktopScannerSplashScreen({ onComplete }: Props) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    document.body.classList.add("desktop-scanner-splash-page");
    return () => document.body.classList.remove("desktop-scanner-splash-page");
  }, []);

  useEffect(() => {
    const start = performance.now();
    let frame = 0;
    let completeTimer = 0;

    const tick = (now: number) => {
      const nextProgress = Math.min(100, ((now - start) / SPLASH_DURATION_MS) * 100);
      setProgress(nextProgress);

      if (nextProgress < 100) {
        frame = requestAnimationFrame(tick);
        return;
      }

      completeTimer = window.setTimeout(() => onCompleteRef.current(), 220);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(completeTimer);
    };
  }, []);

  return (
    <div className="desktop-scanner-splash" role="status" aria-live="polite" aria-busy={progress < 100}>
      <div className="desktop-scanner-splash__content">
        <div className="desktop-scanner-splash__card">
          <div className="desktop-scanner-splash__icon-wrap">
            <ScannerAppIcon />
          </div>
          <h1 className="desktop-scanner-splash__title">Desktop Scanner</h1>
          <p className="desktop-scanner-splash__tagline">Secure document scanning made simple.</p>

          <div
            className="desktop-scanner-splash__progress-track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            aria-label="Loading application"
          >
            <div className="desktop-scanner-splash__progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <p className="desktop-scanner-splash__status">Preparing your workspace...</p>
        </div>

        <p className="desktop-scanner-splash__footer">
          ADMIN - CONTROLLED ACCESS · SAFE LOCAL SCANNING · ONLINE / OFFLINE READY
        </p>
      </div>
    </div>
  );
}
