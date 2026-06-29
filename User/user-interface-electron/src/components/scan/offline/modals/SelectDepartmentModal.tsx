import { Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DEPARTMENTS } from "../scanOfflineData";
import { resolveDepartmentLabel } from "../scanOfflineHelpers";
import { ScanModalShell } from "./ScanModalShell";

type SelectDepartmentModalProps = {
  departmentId: string;
  customDepartmentLabel?: string;
  onApply: (departmentId: string, customDepartmentLabel?: string) => void;
  onClose: () => void;
};

export function SelectDepartmentModal({
  departmentId,
  customDepartmentLabel = "",
  onApply,
  onClose,
}: SelectDepartmentModalProps) {
  const [query, setQuery] = useState("");
  const [draftId, setDraftId] = useState(departmentId);
  const [customLabel, setCustomLabel] = useState(customDepartmentLabel);

  useEffect(() => {
    setDraftId(departmentId);
    setCustomLabel(customDepartmentLabel);
  }, [departmentId, customDepartmentLabel]);

  const filtered = useMemo(() => {
    if (!query.trim()) return DEPARTMENTS;
    const q = query.toLowerCase();
    return DEPARTMENTS.filter(
      (department) =>
        department.label.toLowerCase().includes(q) ||
        department.description?.toLowerCase().includes(q),
    );
  }, [query]);

  const summaryLabel = resolveDepartmentLabel({
    departmentId: draftId,
    customDepartmentLabel: draftId === "others" ? customLabel : "",
  });

  const canApply = draftId !== "others" || customLabel.trim().length > 0;

  return (
    <ScanModalShell
      title="Select Department"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="scan-btn scan-btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="scan-btn scan-btn--primary"
            disabled={!canApply}
            onClick={() => {
              onApply(draftId, draftId === "others" ? customLabel.trim() : "");
              onClose();
            }}
          >
            Apply
          </button>
        </>
      }
    >
      <div className="scan-department-modal">
        <input
          type="search"
          className="scan-department-modal__search"
          placeholder="Search department..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search department"
        />

        <div className="scan-department-modal__list">
          {filtered.map((department) => {
            const active = department.id === draftId;
            return (
              <button
                key={department.id}
                type="button"
                className={`scan-department-modal__item${
                  active ? " scan-department-modal__item--active" : ""
                }`}
                onClick={() => setDraftId(department.id)}
              >
                <span className="scan-department-modal__copy">
                  <span className="scan-department-modal__label">{department.label}</span>
                  {department.description ? (
                    <span className="scan-department-modal__desc">{department.description}</span>
                  ) : null}
                </span>
                {active ? (
                  <Check className="scan-department-modal__check" strokeWidth={2.5} aria-hidden="true" />
                ) : null}
              </button>
            );
          })}
        </div>

        {draftId === "others" ? (
          <label className="scan-department-modal__specify">
            <span className="scan-department-modal__specify-label">Specify department</span>
            <input
              type="text"
              className="scan-department-modal__specify-input"
              placeholder="Enter department name"
              value={customLabel}
              onChange={(event) => setCustomLabel(event.target.value)}
            />
          </label>
        ) : null}

        <div className="scan-department-modal__summary">
          <span className="scan-department-modal__summary-label">Selected department:</span>
          <span className="scan-department-modal__summary-value">{summaryLabel}</span>
        </div>
      </div>
    </ScanModalShell>
  );
}
