import { ExternalLink, FileImage, FileText, Files } from "lucide-react";
import { formatResultMeta } from "./searchHelpers";
import { HighlightedText } from "./HighlightedText";
import type { SearchResult } from "./searchTypes";

type SearchResultCardProps = {
  result: SearchResult;
  query: string;
  onOpen: () => void;
  onOpenFile: () => void;
  onShowInDocuments: () => void;
};

function FileTypeIcon({ fileType }: { fileType: SearchResult["fileType"] }) {
  if (fileType === "PDF") {
    return <FileText className="search-result-card__icon" strokeWidth={1.8} />;
  }
  return <FileImage className="search-result-card__icon" strokeWidth={1.8} />;
}

export function SearchResultCard({
  result,
  query,
  onOpen,
  onOpenFile,
  onShowInDocuments,
}: SearchResultCardProps) {
  return (
    <article className="search-result-card">
      <button
        type="button"
        className="search-result-card__open"
        onClick={onOpen}
        aria-label={`Open ${result.fileName}`}
      >
        <div className={`search-result-card__thumb search-result-card__thumb--${result.fileType.toLowerCase()}`}>
          <FileTypeIcon fileType={result.fileType} />
          <span className="search-result-card__type">{result.fileType}</span>
        </div>
        <div className="search-result-card__body">
          <h3 className="search-result-card__title">
            <HighlightedText text={result.fileName} query={query} />
          </h3>
          <p className="search-result-card__meta">{formatResultMeta(result)}</p>
          <p className="search-result-card__snippet">
            <span className="search-result-card__ellipsis" aria-hidden="true">
              …{" "}
            </span>
            <HighlightedText text={result.snippet} query={query} />
            <span className="search-result-card__ellipsis" aria-hidden="true">
              {" "}
              …
            </span>
          </p>
        </div>
      </button>
      <div className="search-result-card__actions">
        <button type="button" className="search-result-card__documents-link" onClick={onOpenFile}>
          <ExternalLink className="h-4 w-4" strokeWidth={2} />
          Open
        </button>
        <button type="button" className="search-result-card__documents-link" onClick={onShowInDocuments}>
          <Files className="h-4 w-4" strokeWidth={2} />
          Show in Documents
        </button>
      </div>
    </article>
  );
}
