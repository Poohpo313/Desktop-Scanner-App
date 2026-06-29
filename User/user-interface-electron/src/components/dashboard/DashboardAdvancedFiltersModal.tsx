import { ChevronDown, X } from "lucide-react";
import { createPortal } from "react-dom";
import {
  DASHBOARD_FILE_TYPE_OPTIONS,
  type DashboardDepartmentFilterId,
  type DashboardFileTypeFilter,
  dashboardDepartmentLabel,
} from "./dashboardData";
import "../../styles/dashboard-filters-modal.css";

type DashboardAdvancedFiltersModalProps = {
  fileType: DashboardFileTypeFilter;
  departmentId: DashboardDepartmentFilterId;
  onFileTypeChange: (fileType: DashboardFileTypeFilter) => void;
  onOpenDepartmentFilter: () => void;
  onReset: () => void;
  onApply: () => void;
  onClose: () => void;
};

export function DashboardAdvancedFiltersModal({
  fileType,
  departmentId,
  onFileTypeChange,
  onOpenDepartmentFilter,
  onReset,
  onApply,
  onClose,
}: DashboardAdvancedFiltersModalProps) {
  return createPortal(
    <div className="dash-filters-backdrop" role="presentation" onClick={onClose}>
      <div
        className="dash-filters-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dash-advanced-filters-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="dash-filters-modal__header">
          <div>
            <h2 id="dash-advanced-filters-title" className="dash-filters-modal__title">
              Advanced Filters
            </h2>
            <p className="dash-filters-modal__subtitle">
              Refine scanned files by type and department.
            </p>
          </div>
          <button type="button" className="dash-filters-modal__close" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </header>

        <div className="dash-filters-modal__body">
          <div className="dash-filters-modal__field">
            <span className="dash-filters-modal__label">File Type</span>
            <div className="dash-filters-modal__pills">
              {DASHBOARD_FILE_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`dash-filters-modal__pill${
                    fileType === option.id ? " dash-filters-modal__pill--active" : ""
                  }`}
                  onClick={() => onFileTypeChange(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="dash-filters-modal__field">
            <span className="dash-filters-modal__label">Department</span>
            <button
              type="button"
              className="dash-filters-modal__select"
              onClick={onOpenDepartmentFilter}
            >
              <span>{dashboardDepartmentLabel(departmentId)}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-[#94A3B8]" strokeWidth={1.8} />
            </button>
          </div>
        </div>

        <footer className="dash-filters-modal__footer">
          <button type="button" className="dash-filters-modal__reset" onClick={onReset}>
            Reset Filters
          </button>
          <div className="dash-filters-modal__footer-actions">
            <button type="button" className="dash-filters-modal__btn dash-filters-modal__btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="dash-filters-modal__btn dash-filters-modal__btn--primary" onClick={onApply}>
              Apply Filters
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
