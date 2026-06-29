import { useEffect, useRef, useState } from "react";
import { useAuth } from "./useAuth";

export function useSessionTimeout() {
  const { isAuthenticated } = useAuth();
  const [warning] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || started.current) return;
    started.current = true;
  }, [isAuthenticated]);

  return { warning, dismissWarning: () => undefined };
}
