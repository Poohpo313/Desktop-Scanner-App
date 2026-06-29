import { SCAN_STEPS, type ScanStepId } from "./scanOfflineData";

type OfflineScanStepperProps = {
  current: ScanStepId;
  onStepClick: (step: ScanStepId) => void;
};

export function OfflineScanStepper({ current, onStepClick }: OfflineScanStepperProps) {
  const currentIndex = SCAN_STEPS.findIndex((s) => s.id === current);

  return (
    <div className="scan-offline-stepper" role="tablist" aria-label="Scan steps">
      {SCAN_STEPS.map((step, index) => {
        const active = step.id === current;
        const done = index < currentIndex;
        const state = active ? "active" : done ? "done" : "pending";
        const clickable = index <= currentIndex;

        return (
          <div key={step.id} className={`scan-offline-stepper__item scan-offline-stepper__item--${state}`}>
            <button
              type="button"
              className="scan-offline-stepper__btn"
              disabled={!clickable}
              aria-current={active ? "step" : undefined}
              onClick={() => onStepClick(step.id)}
            >
              <span className="scan-offline-stepper__num">{index + 1}</span>
              <span className="scan-offline-stepper__label">{step.label}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
