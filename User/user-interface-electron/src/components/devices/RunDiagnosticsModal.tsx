import { Check, LoaderCircle, Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ManagedDevice } from "./devicesData";
import { DIAGNOSTIC_TESTS, type DiagnosticTestId } from "./diagnosticsData";
import {
  buildDiagnosticsResult,
  runAllDiagnosticTests,
  type DiagnosticCheckResult,
} from "./runDeviceDiagnostics";
import "../../styles/run-diagnostics-modal.css";

type TestStatus = "pending" | "running" | "passed" | "failed";

type RunDiagnosticsModalProps = {
  device: ManagedDevice;
  onCancel: () => void;
  onComplete: (message: string, healthy: boolean) => void;
};

function initialStatuses(): Record<DiagnosticTestId, TestStatus> {
  return DIAGNOSTIC_TESTS.reduce(
    (acc, test) => {
      acc[test.id] = "pending";
      return acc;
    },
    {} as Record<DiagnosticTestId, TestStatus>,
  );
}

function initialDetails(): Record<DiagnosticTestId, string> {
  return DIAGNOSTIC_TESTS.reduce(
    (acc, test) => {
      acc[test.id] = "";
      return acc;
    },
    {} as Record<DiagnosticTestId, string>,
  );
}

export function RunDiagnosticsModal({ device, onCancel, onComplete }: RunDiagnosticsModalProps) {
  const [statuses, setStatuses] = useState(initialStatuses);
  const [details, setDetails] = useState(initialDetails);
  const [isRunning, setIsRunning] = useState(false);
  const continueRef = useRef(true);

  useEffect(() => {
    continueRef.current = true;
    return () => {
      continueRef.current = false;
    };
  }, []);

  async function handleRunDiagnostics() {
    if (isRunning) return;

    setIsRunning(true);
    setStatuses(initialStatuses());
    setDetails(initialDetails());
    continueRef.current = true;

    const runningStatuses = { ...initialStatuses() };
    const collected: DiagnosticCheckResult[] = [];

    await runAllDiagnosticTests(
      device,
      (result) => {
        if (result.detail === "") {
          runningStatuses[result.id] = "running";
          setStatuses({ ...runningStatuses });
          return;
        }

        runningStatuses[result.id] = result.passed ? "passed" : "failed";
        collected.push(result);
        setStatuses({ ...runningStatuses });
        setDetails((current) => ({ ...current, [result.id]: result.detail }));
      },
      () => continueRef.current,
    );

    if (!continueRef.current) {
      setIsRunning(false);
      return;
    }

    const summary = buildDiagnosticsResult(collected);
    onComplete(summary.message, summary.healthy);
    setIsRunning(false);
  }

  return createPortal(
    <div className="run-diagnostics-modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="run-diagnostics-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="run-diagnostics-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="run-diagnostics-modal__header">
          <div>
            <h2 id="run-diagnostics-modal-title" className="run-diagnostics-modal__title">
              Run Diagnostics
            </h2>
            <p className="run-diagnostics-modal__subtitle">
              Run a series of tests to check your scanner&apos;s health and configuration.
            </p>
          </div>
          <button
            type="button"
            className="run-diagnostics-modal__close"
            onClick={onCancel}
            aria-label="Close"
            disabled={isRunning}
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </header>

        <div className="run-diagnostics-modal__body">
          <ul className="run-diagnostics-modal__list">
            {DIAGNOSTIC_TESTS.map((test) => {
              const Icon = test.icon;
              const status = statuses[test.id];
              const detail = details[test.id];
              return (
                <li key={test.id} className="run-diagnostics-modal__item">
                  <span className="run-diagnostics-modal__item-icon-wrap">
                    <Icon className="run-diagnostics-modal__item-icon" strokeWidth={1.8} />
                  </span>
                  <div className="run-diagnostics-modal__item-copy">
                    <p className="run-diagnostics-modal__item-title">{test.title}</p>
                    <p className="run-diagnostics-modal__item-desc">
                      {detail || test.description}
                    </p>
                  </div>
                  <span
                    className={`run-diagnostics-modal__status run-diagnostics-modal__status--${status}`}
                    aria-label={`${test.title} ${status}`}
                  >
                    {status === "running" ? (
                      <LoaderCircle className="run-diagnostics-modal__spinner" strokeWidth={2} />
                    ) : status === "passed" ? (
                      <Check className="run-diagnostics-modal__check" strokeWidth={2.2} />
                    ) : status === "failed" ? (
                      <X className="run-diagnostics-modal__fail" strokeWidth={2.2} />
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <footer className="run-diagnostics-modal__footer">
          <button
            type="button"
            className="run-diagnostics-modal__btn run-diagnostics-modal__btn--cancel"
            onClick={onCancel}
            disabled={isRunning}
          >
            Cancel
          </button>
          <button
            type="button"
            className="run-diagnostics-modal__btn run-diagnostics-modal__btn--run"
            onClick={() => void handleRunDiagnostics()}
            disabled={isRunning}
          >
            <Play className="h-4 w-4" strokeWidth={2} />
            Run Diagnostics
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
