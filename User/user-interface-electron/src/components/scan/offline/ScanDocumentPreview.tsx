import type { CSSProperties } from "react";
import { useSession } from "../../../context/SessionContext";
import {
  getColorModeLabel,
  getDocumentPreviewColorClass,
  getDocumentPreviewMeta,
  getDocumentPreviewPaperClass,
  getPaperSizeDisplay,
} from "./scanOfflineHelpers";
import type { OfflineScanConfig } from "./scanOfflineData";

type ScanDocumentPreviewProps = {
  variant?: "default" | "thumbnail";
  previewStyle?: CSSProperties;
  scanImageUrl?: string | null;
  caption?: string;
  config?: Pick<OfflineScanConfig, "departmentId" | "paperSizeId" | "colorModeId">;
};

const TEXT_BAR_WIDTHS = ["96%", "88%", "92%", "74%", "85%", "68%"];

export function ScanDocumentPreview({
  variant = "default",
  previewStyle,
  scanImageUrl,
  caption,
  config,
}: ScanDocumentPreviewProps) {
  const { session } = useSession();
  const preparedFor = session.displayName?.trim() || "Assigned User";
  const departmentId = config?.departmentId ?? "finance";
  const paperSizeId = config?.paperSizeId ?? "a4";
  const colorModeId = config?.colorModeId ?? "color";
  const meta = getDocumentPreviewMeta(departmentId);
  const isThumb = variant === "thumbnail";
  const bodyLines = isThumb ? meta.bodyLines.slice(0, 1) : meta.bodyLines;
  const textBars = isThumb ? TEXT_BAR_WIDTHS.slice(0, 3) : TEXT_BAR_WIDTHS;

  const pageClassName = [
    "scan-doc-preview__page",
    getDocumentPreviewPaperClass(paperSizeId),
    getDocumentPreviewColorClass(colorModeId),
    isThumb ? "scan-doc-preview__page--thumb" : "",
    scanImageUrl ? "scan-doc-preview__page--image" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (scanImageUrl) {
    return (
      <div
        className={`scan-doc-preview${isThumb ? " scan-doc-preview--thumb" : ""}`}
        aria-hidden={isThumb}
      >
        <div className={pageClassName} style={isThumb ? undefined : previewStyle}>
          <img
            src={scanImageUrl}
            alt="Scanned document preview"
            className="scan-doc-preview__image"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
          {caption ? <span className="scan-doc-preview__live-tag">{caption}</span> : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`scan-doc-preview${isThumb ? " scan-doc-preview--thumb" : ""}`}
      aria-hidden={isThumb}
    >
      <div className={pageClassName} style={isThumb ? undefined : previewStyle}>
        <div className="scan-doc-preview__header">
          <p className="scan-doc-preview__doc-type">{meta.documentType}</p>
          <p className="scan-doc-preview__ref">Ref: {meta.reference}</p>
        </div>

        <p className="scan-doc-preview__meta-line">Date: May 20, 2024</p>
        <p className="scan-doc-preview__meta-line">Prepared for: {preparedFor}</p>
        <p className="scan-doc-preview__meta-line">
          Paper: {getPaperSizeDisplay(paperSizeId)} · {getColorModeLabel(colorModeId)}
        </p>

        <div className="scan-doc-preview__body">
          <p className="scan-doc-preview__paragraph">{meta.openingLine}</p>
          {bodyLines.map((line) => (
            <p key={line} className="scan-doc-preview__paragraph">
              {line}
            </p>
          ))}
          <div className="scan-doc-preview__text-bars" aria-hidden="true">
            {textBars.map((width, index) => (
              <span
                key={`${width}-${index}`}
                className="scan-doc-preview__text-bar"
                style={{ width }}
              />
            ))}
          </div>
        </div>

        <div className="scan-doc-preview__footer">
          <div className="scan-doc-preview__signature">
            <span className="scan-doc-preview__signature-label">Signature</span>
            <span className="scan-doc-preview__signature-line" />
          </div>
          <span className="scan-doc-preview__live-tag">Live scan preview · Page 1</span>
        </div>
      </div>
    </div>
  );
}
