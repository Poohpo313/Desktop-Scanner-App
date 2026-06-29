import { useCallback, useEffect, useRef, useState } from "react";
import { copyToClipboard } from "./copyToClipboard";

const DEFAULT_COPIED_DURATION_MS = 1800;

export function useCopyWithFeedback(durationMs = DEFAULT_COPIED_DURATION_MS) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const copy = useCallback(
    (text: string) => {
      copyToClipboard(text);
      setCopied(true);

      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        setCopied(false);
        timeoutRef.current = null;
      }, durationMs);
    },
    [durationMs],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { copied, copy };
}
