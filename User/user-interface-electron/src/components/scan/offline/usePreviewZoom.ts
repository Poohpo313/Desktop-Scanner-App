import { useCallback, useState } from "react";
import type { CSSProperties } from "react";

const ZOOM_LEVELS = [50, 75, 100, 125, 150, 200] as const;
const PREVIEW_BASE_WIDTH = 280;
const PREVIEW_BASE_HEIGHT = 380;

export function usePreviewZoom(initial = 100) {
  const [zoom, setZoom] = useState(initial);

  const zoomIn = useCallback(() => {
    setZoom((current) => {
      const index = ZOOM_LEVELS.indexOf(current as (typeof ZOOM_LEVELS)[number]);
      const next = index < 0 ? 100 : ZOOM_LEVELS[Math.min(index + 1, ZOOM_LEVELS.length - 1)];
      return next;
    });
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((current) => {
      const index = ZOOM_LEVELS.indexOf(current as (typeof ZOOM_LEVELS)[number]);
      const next = index < 0 ? 100 : ZOOM_LEVELS[Math.max(index - 1, 0)];
      return next;
    });
  }, []);

  const scale = zoom / 100;

  return {
    zoom,
    zoomLabel: `${zoom}%`,
    zoomIn,
    zoomOut,
    fitToPage: () => setZoom(100),
    previewStyle: {
      width: PREVIEW_BASE_WIDTH,
      transform: `scale(${scale})`,
      transformOrigin: "top center",
    } as CSSProperties,
    stageStyle: {
      width: PREVIEW_BASE_WIDTH * scale,
      height: PREVIEW_BASE_HEIGHT * scale,
      margin: "0 auto",
    } as CSSProperties,
  };
}
