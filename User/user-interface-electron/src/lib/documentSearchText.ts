import type { SavedDocument } from "./documents";

const OCR_SNIPPETS: Array<{ match: RegExp; snippet: string }> = [
  {
    match: /finance|invoice/i,
    snippet:
      "Finance department invoice for vendor services. Invoice Number INV-2024-1058. Payment terms net 30. Total amount due for May 2024 billing period.",
  },
  {
    match: /report|quarter/i,
    snippet:
      "Quarterly Report summary shows revenue growth across all departments for Q2. Finance review notes and executive summary included.",
  },
  {
    match: /contract/i,
    snippet:
      "Contract terms and renewal conditions for the vendor agreement period. Legal review and signature blocks included.",
  },
  {
    match: /receipt/i,
    snippet:
      "Payment receipt confirming transaction amount and date of purchase. Finance reconciliation reference attached.",
  },
  {
    match: /enrollment|registrar/i,
    snippet:
      "Enrollment records and student clearance documents for the current term. Registrar office processing notes.",
  },
  {
    match: /policy|hr|employee/i,
    snippet:
      "Updated HR policy section covering leave, benefits, and onboarding requirements for staff members.",
  },
  {
    match: /grant|research/i,
    snippet:
      "Research grant application narrative and budget justification summary for departmental funding review.",
  },
  {
    match: /ledger|accounting/i,
    snippet:
      "Accounting ledger entries reconciled for the monthly closing period. Finance audit trail documented.",
  },
  {
    match: /inventory/i,
    snippet:
      "Inventory checklist with item counts verified during the stock audit. Asset tracking notes included.",
  },
  {
    match: /memo|management|admin/i,
    snippet:
      "Internal memo regarding management decisions and administrative follow-up actions for the office.",
  },
];

export function inferDocumentOcrText(doc: SavedDocument): string {
  if (doc.ocrText?.trim()) return doc.ocrText.trim();
  if (doc.notes?.trim()) return doc.notes.trim();

  const haystack = `${doc.fileName} ${doc.department} ${doc.departmentId}`;
  const matched = OCR_SNIPPETS.find((entry) => entry.match.test(haystack));
  if (matched) return matched.snippet;

  const readableName = doc.fileName
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[_\-.]+/g, " ")
    .trim();

  return `${readableName}. Department: ${doc.department}. Scanned document with searchable OCR text and indexed metadata.`;
}

export function getDocumentSearchHaystack(doc: SavedDocument): string {
  const ocrText = inferDocumentOcrText(doc);
  return `${doc.fileName} ${doc.department} ${doc.notes ?? ""} ${ocrText}`.toLowerCase();
}
