import { useLayoutEffect, type MutableRefObject } from "react";

export function useRegisterExportAction(
  ref: MutableRefObject<(() => void | Promise<void>) | null> | undefined,
  action: () => void | Promise<void>
) {
  useLayoutEffect(() => {
    if (!ref) {
      return;
    }

    ref.current = action;

    return () => {
      ref.current = null;
    };
  }, [ref, action]);
}
