import { useState } from "react";
import HelpSupportReportsFilterDropdown from "./HelpSupportReportsFilterDropdown";
import HelpSupportTroubleshootingFilterDropdown from "./HelpSupportTroubleshootingFilterDropdown";
import type {
  HelpSupportReportsFilter,
  HelpSupportTroubleshootingFilter,
} from "../../data/demoHelpSupportCatalog";
import "../../styles/help-support-screen.css";
import "../../styles/help-support-reports-filter.css";

type Props = {
  reportsFilter: HelpSupportReportsFilter;
  onReportsFilterChange: (value: HelpSupportReportsFilter) => void;
  troubleshootingFilter: HelpSupportTroubleshootingFilter;
  onTroubleshootingFilterChange: (value: HelpSupportTroubleshootingFilter) => void;
  onExportReport: () => void;
};

export default function HelpSupportHeaderActions({
  reportsFilter,
  onReportsFilterChange,
  troubleshootingFilter,
  onTroubleshootingFilterChange,
  onExportReport,
}: Props) {
  const [reportsFilterOpen, setReportsFilterOpen] = useState(false);
  const [troubleshootingFilterOpen, setTroubleshootingFilterOpen] = useState(false);

  const handleReportsFilterOpenChange = (nextOpen: boolean) => {
    setReportsFilterOpen(nextOpen);
    if (nextOpen) {
      setTroubleshootingFilterOpen(false);
    }
  };

  const handleTroubleshootingFilterOpenChange = (nextOpen: boolean) => {
    setTroubleshootingFilterOpen(nextOpen);
    if (nextOpen) {
      setReportsFilterOpen(false);
    }
  };

  return (
    <div className="help-support-screen__header-actions">
      <button type="button" className="help-support-screen__export-btn" onClick={onExportReport}>
        Export Report
      </button>
      <HelpSupportTroubleshootingFilterDropdown
        value={troubleshootingFilter}
        open={troubleshootingFilterOpen}
        onOpenChange={handleTroubleshootingFilterOpenChange}
        onApply={onTroubleshootingFilterChange}
      />
      <HelpSupportReportsFilterDropdown
        value={reportsFilter}
        open={reportsFilterOpen}
        onOpenChange={handleReportsFilterOpenChange}
        onApply={onReportsFilterChange}
      />
    </div>
  );
}
