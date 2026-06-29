import { useEffect, useMemo, useRef, useState } from "react";
import FigmaModal from "./FigmaModal";
import { IconUserPlus } from "../icons/AdminIcons";
import "../../styles/creating-user-account-modal.css";

type StepStatus = "waiting" | "active" | "complete";

type CreationStep = {
  id: string;
  label: string;
};

type Props = {
  onComplete: () => void;
  sendWelcomeEmail: boolean;
};

const RING_CIRCUMFERENCE = 327;
const STEP_ADVANCE_MS = 1800;

function buildCreationSteps(sendWelcomeEmail: boolean): CreationStep[] {
  const steps: CreationStep[] = [
    { id: "validate", label: "Validating Information" },
    { id: "profile", label: "Creating User Profile" },
    { id: "permissions", label: "Assigning Permissions" },
  ];

  if (sendWelcomeEmail) {
    steps.push({ id: "email", label: "Sending Welcome Email" });
  }

  return steps;
}

function statusLabel(status: StepStatus, stepIndex: number, stepId: string): string {
  if (status === "complete") {
    if (stepIndex === 0) return "Verified";
    if (stepId === "email") return "Sent";
    return "Complete";
  }
  if (status === "active") return "In progress...";
  return "Waiting";
}

function StepIcon({ status }: { status: StepStatus }) {
  if (status === "complete") {
    return (
      <span className="register-create__step-icon register-create__step-icon--complete" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M5.25 9.25L7.75 11.75L12.75 6.75"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }

  if (status === "active") {
    return (
      <span className="register-create__step-icon register-create__step-icon--active" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="6.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="24 12" />
        </svg>
      </span>
    );
  }

  return (
    <span className="register-create__step-icon register-create__step-icon--waiting" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="6.25" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2.5 3.5" />
      </svg>
    </span>
  );
}

function statusesForActiveIndex(activeIndex: number, stepCount: number): StepStatus[] {
  return Array.from({ length: stepCount }, (_, index) => {
    if (index < activeIndex) return "complete";
    if (index === activeIndex) return "active";
    return "waiting";
  });
}

function ringProgressForActiveIndex(activeIndex: number, stepCount: number): number {
  return Math.round((activeIndex / stepCount) * 100);
}

export default function CreatingUserAccountModal({ onComplete, sendWelcomeEmail }: Props) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const steps = useMemo(() => buildCreationSteps(sendWelcomeEmail), [sendWelcomeEmail]);
  const stepCount = steps.length;

  const [activeIndex, setActiveIndex] = useState(1);
  const [statuses, setStatuses] = useState<StepStatus[]>(() => statusesForActiveIndex(1, stepCount));
  const [ringProgress, setRingProgress] = useState(() => ringProgressForActiveIndex(1, stepCount));

  useEffect(() => {
    const timers: number[] = [];
    let nextIndex = 2;

    const advance = () => {
      if (nextIndex >= stepCount) {
        setStatuses(Array.from({ length: stepCount }, () => "complete"));
        setActiveIndex(stepCount);
        setRingProgress(100);
        timers.push(window.setTimeout(() => onCompleteRef.current(), 450));
        return;
      }

      setStatuses(statusesForActiveIndex(nextIndex, stepCount));
      setActiveIndex(nextIndex);
      setRingProgress(ringProgressForActiveIndex(nextIndex, stepCount));
      nextIndex += 1;
      timers.push(window.setTimeout(advance, STEP_ADVANCE_MS));
    };

    timers.push(window.setTimeout(advance, STEP_ADVANCE_MS));

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [stepCount]);

  return (
    <FigmaModal className="figma-modal--register-create" hideHeader hideClose>
      <div className="register-create" role="status" aria-live="polite" aria-busy="true">
        <div className="register-create__hero">
          <div className="register-create__ring-wrap" aria-hidden="true">
            <svg className="register-create__ring" viewBox="0 0 120 120">
              <circle className="register-create__ring-track" cx="60" cy="60" r="52" />
              <circle
                className="register-create__ring-fill"
                cx="60"
                cy="60"
                r="52"
                style={{ strokeDashoffset: RING_CIRCUMFERENCE - (RING_CIRCUMFERENCE * ringProgress) / 100 }}
              />
            </svg>
            <div className="register-create__ring-icon">
              <IconUserPlus />
            </div>
          </div>
          <h2 className="register-create__title">Creating User Account...</h2>
        </div>

        <ol className="register-create__steps">
          {steps.map((step, index) => {
            const status = statuses[index] ?? "waiting";
            const dimmed = status === "waiting";

            return (
              <li
                key={step.id}
                className={`register-create__step${dimmed ? " register-create__step--dimmed" : ""}`}
              >
                <StepIcon status={status} />
                <div className="register-create__step-copy">
                  <p className="register-create__step-label">{step.label}</p>
                  <p className={`register-create__step-status register-create__step-status--${status}`}>
                    {statusLabel(status, index, step.id)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="register-create__footer-copy">
          <p>This process usually takes less than 10 seconds.</p>
          <p>Please do not refresh the page.</p>
        </div>
      </div>
    </FigmaModal>
  );
}
