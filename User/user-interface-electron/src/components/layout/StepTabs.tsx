type Step = { id: string; label: string };

type Props = {
  steps: Step[];
  current: string;
};

export function StepTabs({ steps, current }: Props) {
  const currentIndex = steps.findIndex((s) => s.id === current);

  return (
    <div className="step-tabs" role="tablist" aria-label="Scan steps">
      {steps.map((step, index) => {
        const active = step.id === current;
        const done = index < currentIndex;
        const state = active ? "active" : done ? "done" : "pending";

        return (
          <div
            key={step.id}
            role="tab"
            aria-selected={active}
            className={`step-tabs__item step-tabs__item--${state}`}
          >
            <span className="step-tabs__num">{index + 1}</span>
            {step.label}
          </div>
        );
      })}
    </div>
  );
}
