import type { CSSProperties, ReactNode } from "react";

type ScanPreviewViewportProps = {
  stageStyle?: CSSProperties;
  children: ReactNode;
};

export function ScanPreviewViewport({ stageStyle, children }: ScanPreviewViewportProps) {
  return (
    <div className="scan-preview-viewport">
      <div className="scan-preview-viewport__stage" style={stageStyle}>
        {children}
      </div>
    </div>
  );
}
