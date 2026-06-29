import { Navigate } from "react-router-dom";

export function RetryConnectionModalScreen() {
  return (
    <Navigate
      to="/device-management"
      replace
      state={{ retryConnection: { id: "", name: "", typeVariant: "output" as const } }}
    />
  );
}

export default RetryConnectionModalScreen;
