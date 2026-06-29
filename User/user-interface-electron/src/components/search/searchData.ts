import type { SavedDocument } from "../../lib/documents";
import { inferDocumentOcrText } from "../../lib/documentSearchText";
import type { SearchResult } from "./searchTypes";
import { buildSnippetAroundMatch, getHighlightTerms } from "./searchHelpers";

function tagsForDocument(doc: SavedDocument): string[] {
  const base = doc.departmentId;
  const name = doc.fileName.toLowerCase();
  const tags = [base];
  if (name.includes("invoice")) tags.push("invoice");
  if (name.includes("report")) tags.push("report");
  if (name.includes("receipt")) tags.push("receipt");
  if (name.includes("finance")) tags.push("finance");
  if (name.includes("contract")) tags.push("contract");
  return tags;
}

export function buildSearchCatalog(documents: SavedDocument[], query = ""): SearchResult[] {
  return documents.map((doc) => {
    const ocrText = inferDocumentOcrText(doc);
    return {
      id: doc.id,
      fileName: doc.fileName,
      fileType: doc.fileType,
      pages: doc.pages,
      department: doc.department,
      departmentId: doc.departmentId,
      modifiedAt: doc.modifiedAt,
      ocrText,
      snippet: buildSnippetAroundMatch(ocrText, query),
      tags: tagsForDocument(doc),
      savePath: doc.savePath,
    };
  });
}

export function buildSearchCatalogForQuery(documents: SavedDocument[], query: string): SearchResult[] {
  const terms = getHighlightTerms(query);
  if (terms.length === 0) {
    return buildSearchCatalog(documents);
  }

  return documents.map((doc) => {
    const ocrText = inferDocumentOcrText(doc);
    const fileNameHaystack = doc.fileName.toLowerCase();
    const ocrHaystack = ocrText.toLowerCase();

    let snippetSource = ocrText;
    for (const term of terms) {
      if (ocrHaystack.includes(term.toLowerCase())) {
        snippetSource = ocrText;
        break;
      }
      if (fileNameHaystack.includes(term.toLowerCase())) {
        snippetSource = `${doc.fileName}. ${ocrText}`;
        break;
      }
    }

    return {
      id: doc.id,
      fileName: doc.fileName,
      fileType: doc.fileType,
      pages: doc.pages,
      department: doc.department,
      departmentId: doc.departmentId,
      modifiedAt: doc.modifiedAt,
      ocrText,
      snippet: buildSnippetAroundMatch(snippetSource, query),
      tags: tagsForDocument(doc),
      savePath: doc.savePath,
    };
  });
}
