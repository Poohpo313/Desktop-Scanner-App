import { Navigate } from "react-router-dom";

export function ReportIssueModalScreen() {
  return (
    <Navigate
      to="/device-management"
      replace
      state={{ reportIssue: { id: "", name: "" } }}
    />
  );
}

export default ReportIssueModalScreen;
