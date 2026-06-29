import { Link } from "react-router-dom";
import type { FileRecord } from "../hooks/useFiles";

type Props = {
  file: FileRecord;
  onDelete?: (id: number) => void;
  onRestore?: (id: number) => void;
  inRecycleBin?: boolean;
  showPreview?: boolean;
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const typeColors: Record<string, string> = {
  pdf: "bg-orange-50 text-orange-700",
  png: "bg-blue-50 text-blue-700",
  jpg: "bg-yellow-50 text-yellow-700",
};

export function FileCard({ file, onDelete, onRestore, inRecycleBin, showPreview }: Props) {
  const typeClass = typeColors[file.file_type?.toLowerCase()] ?? "bg-gray-100 text-gray-600";

  return (
    <article className="card-surface p-4 hover:border-brand-emerald transition">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0">
          <span className="text-2xl shrink-0" aria-hidden="true">📄</span>
          <div className="min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{file.filename}</h3>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(file.upload_date).toLocaleString()} · {formatSize(Number(file.file_size))}
            </p>
            {showPreview && (
              <p className="text-xs text-gray-400 mt-2 line-clamp-2 italic">
                Document content indexed for search…
              </p>
            )}
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full uppercase shrink-0 ${typeClass}`}>
          {file.file_type}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            file.cloud_status === "synced"
              ? "bg-brand-mint text-brand-primary"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {file.cloud_status}
        </span>
        <div className="flex gap-2 ml-auto">
          {!inRecycleBin && (
            <Link to="/print" className="text-xs text-brand-emerald hover:underline">
              Print
            </Link>
          )}
          {inRecycleBin && onRestore ? (
            <button
              type="button"
              className="text-xs text-brand-emerald hover:underline"
              onClick={() => onRestore(file.document_id)}
            >
              Restore
            </button>
          ) : onDelete ? (
            <button
              type="button"
              className="text-xs text-status-error hover:underline"
              onClick={() => onDelete(file.document_id)}
            >
              Delete
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
