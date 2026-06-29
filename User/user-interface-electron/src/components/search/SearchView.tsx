import { ChevronDown } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDocuments } from "../../context/DocumentsContext";
import { openDocumentFile, openDocumentInWord } from "../../lib/openDocumentFile";
import { ConsolePageHeader } from "../layout/ConsolePageHeader";
import { getConsolePageSubtitle, getConsolePageTitle } from "../layout/consolePageMeta";
import { AdvancedFiltersDrawer } from "./AdvancedFiltersDrawer";
import { buildSearchCatalogForQuery } from "./searchData";
import { filterSearchResults, filterSummary } from "./searchHelpers";
import { SearchResultCard } from "./SearchResultCard";
import { SearchStatusBar } from "./SearchStatusBar";
import { SearchTipsPanel } from "./SearchTipsPanel";
import { DEFAULT_SEARCH_FILTERS, type SearchFilters } from "./searchTypes";
import { useSearchFolders } from "./useSearchFolders";
import "../../styles/search.css";

export function SearchView() {
  const navigate = useNavigate();
  const { documents } = useDocuments();
  const { folders: folderOptions, loading: foldersLoading } = useSearchFolders();

  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_SEARCH_FILTERS);
  const [draftFilters, setDraftFilters] = useState<SearchFilters>(DEFAULT_SEARCH_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);

  const summary = filterSummary(filters, folderOptions);
  const catalog = useMemo(
    () => buildSearchCatalogForQuery(documents, submittedQuery),
    [documents, submittedQuery],
  );
  const results = useMemo(
    () => filterSearchResults(catalog, submittedQuery, filters),
    [catalog, filters, submittedQuery],
  );

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setOpenError(null);
    setSubmittedQuery(trimmed);
  }

  function handleClearAll() {
    setQuery("");
    setSubmittedQuery("");
    setOpenError(null);
    setFilters(DEFAULT_SEARCH_FILTERS);
    setDraftFilters(DEFAULT_SEARCH_FILTERS);
  }

  function openFilters() {
    setDraftFilters(filters);
    setShowFilters(true);
  }

  function applyFilters() {
    setFilters(draftFilters);
    setShowFilters(false);
    if (submittedQuery.trim()) {
      setOpenError(null);
    }
  }

  async function handleOpenResult(savePath: string) {
    setOpenError(null);
    const result = await openDocumentFile(savePath);
    if (!result.success) {
      setOpenError(result.error ?? "Could not open file.");
    }
  }

  async function handleEditInWord(savePath: string) {
    setOpenError(null);
    const result = await openDocumentInWord(savePath);
    if (!result.success) {
      setOpenError(result.error ?? "Could not open file in Word.");
    }
  }

  function openInDocuments(documentId: string) {
    navigate("/files", {
      state: {
        folderId: "all",
        selectedDocumentId: documentId,
        searchQuery: submittedQuery.trim() || undefined,
      },
    });
  }

  return (
    <div className="search-page console-page" data-screen="section-05-search">
      <ConsolePageHeader
        title={getConsolePageTitle("Search")}
        subtitle={getConsolePageSubtitle("Search")}
      />

      <div className="search-page__content console-page__body">
        <form className="search-toolbar console-page__toolbar" onSubmit={handleSubmit}>
          <input
            type="search"
            className="search-toolbar__input"
            placeholder="Search files, OCR text, invoice numbers..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search files"
          />
          <div className="search-toolbar__actions">
            <button type="submit" className="search-btn search-btn--primary">
              Search
            </button>
            <button type="button" className="search-btn search-btn--outline" onClick={openFilters}>
              Advanced Filters
            </button>
          </div>
        </form>

        <div className="search-filter-bar">
          <div className="search-filter-bar__chips">
            <button type="button" className="search-filter-chip" onClick={openFilters}>
              File Type: {summary.fileType}
              <ChevronDown className="search-filter-chip__icon" strokeWidth={2} />
            </button>
            <button type="button" className="search-filter-chip" onClick={openFilters}>
              Date: {summary.date}
              <ChevronDown className="search-filter-chip__icon" strokeWidth={2} />
            </button>
            <button type="button" className="search-filter-chip" onClick={openFilters}>
              Folder: {summary.folder}
              <ChevronDown className="search-filter-chip__icon" strokeWidth={2} />
            </button>
            <button type="button" className="search-filter-chip" onClick={openFilters}>
              Tags: {summary.tags}
              <ChevronDown className="search-filter-chip__icon" strokeWidth={2} />
            </button>
          </div>
          <button type="button" className="search-filter-bar__clear" onClick={handleClearAll}>
            Clear all
          </button>
        </div>

        {openError ? <p className="search-page__error">{openError}</p> : null}

        <div className="search-page__layout">
          <section className="search-results">
            <p className="search-results__count">
              {submittedQuery.trim()
                ? `${results.length} result${results.length === 1 ? "" : "s"} for "${submittedQuery.trim()}"`
                : "Search across filenames, OCR text, departments, and tags"}
            </p>
            <div className="search-results__list">
              {!submittedQuery.trim() ? (
                <p className="search-results__empty">
                  Enter keywords above and press Search. Matching OCR text and file names will appear here.
                </p>
              ) : results.length === 0 ? (
                <p className="search-results__empty">
                  No documents matched your search. Try different keywords or adjust the filters.
                </p>
              ) : (
                results.map((result) => (
                  <SearchResultCard
                    key={result.id}
                    result={result}
                    query={submittedQuery}
                    onOpen={() => void handleOpenResult(result.savePath)}
                    onEditInWord={() => void handleEditInWord(result.savePath)}
                    onShowInDocuments={() => openInDocuments(result.id)}
                  />
                ))
              )}
            </div>
          </section>

          <SearchTipsPanel />
        </div>
      </div>

      <SearchStatusBar />

      {showFilters ? (
        <AdvancedFiltersDrawer
          draft={draftFilters}
          folderOptions={folderOptions}
          foldersLoading={foldersLoading}
          onChange={(patch) => setDraftFilters((current) => ({ ...current, ...patch }))}
          onApply={applyFilters}
          onClose={() => setShowFilters(false)}
        />
      ) : null}
    </div>
  );
}
