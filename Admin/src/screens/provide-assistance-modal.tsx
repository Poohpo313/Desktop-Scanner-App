import { Navigate } from "react-router-dom";

export function ProvideAssistanceModalScreen() {
  return (
    <Navigate
      to="/help-and-support-center-2226-2276"
      replace
      state={{ provideAssistance: true }}
    />
  );
}

export default ProvideAssistanceModalScreen;
