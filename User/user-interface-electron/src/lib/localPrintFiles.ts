import { DEFAULT_SCANNED_DOCUMENTS_ROOT } from "../components/search/searchFolders";

export type LocalPrintFile = {
  name: string;
  path: string;
  pages: number;
};

const FINANCE_FILES: LocalPrintFile[] = [
  {
    name: "Quarter_Report_Q2.pdf",
    path: `${DEFAULT_SCANNED_DOCUMENTS_ROOT}\\Finance\\Quarter_Report_Q2.pdf`,
    pages: 12,
  },
  {
    name: "Finance_Invoice_2024_0520.pdf",
    path: `${DEFAULT_SCANNED_DOCUMENTS_ROOT}\\Finance\\Finance_Invoice_2024_0520.pdf`,
    pages: 2,
  },
  {
    name: "Contract_Draft.pdf",
    path: `${DEFAULT_SCANNED_DOCUMENTS_ROOT}\\Finance\\Contract_Draft.pdf`,
    pages: 5,
  },
  {
    name: "Receipt_May_19.jpg",
    path: `${DEFAULT_SCANNED_DOCUMENTS_ROOT}\\Finance\\Receipt_May_19.jpg`,
    pages: 1,
  },
];

const DEMO_PRINT_FILES: Record<string, LocalPrintFile[]> = {
  [`${DEFAULT_SCANNED_DOCUMENTS_ROOT}\\Finance`]: FINANCE_FILES,
  [`${DEFAULT_SCANNED_DOCUMENTS_ROOT}\\Finance\\Invoices`]: [
    FINANCE_FILES[1],
    {
      name: "Receipt_May_19.jpg",
      path: `${DEFAULT_SCANNED_DOCUMENTS_ROOT}\\Finance\\Invoices\\Receipt_May_19.jpg`,
      pages: 1,
    },
  ],
  [`${DEFAULT_SCANNED_DOCUMENTS_ROOT}\\Finance\\Reports`]: [FINANCE_FILES[0]],
  [`${DEFAULT_SCANNED_DOCUMENTS_ROOT}\\hr`]: [
    {
      name: "Employee_Form_0520.jpg",
      path: `${DEFAULT_SCANNED_DOCUMENTS_ROOT}\\hr\\Employee_Form_0520.jpg`,
      pages: 1,
    },
  ],
  [`${DEFAULT_SCANNED_DOCUMENTS_ROOT}\\admin`]: [
    {
      name: "Memo_Management.png",
      path: `${DEFAULT_SCANNED_DOCUMENTS_ROOT}\\admin\\Memo_Management.png`,
      pages: 1,
    },
  ],
};

export function listDemoPrintFiles(dirPath: string): LocalPrintFile[] {
  const normalized = dirPath.trim();
  return DEMO_PRINT_FILES[normalized] ?? [];
}

export const DEFAULT_LOCAL_PRINT_BROWSE_PATH = `${DEFAULT_SCANNED_DOCUMENTS_ROOT}\\Finance`;
