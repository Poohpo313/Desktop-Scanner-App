export type LicenseKeyCatalogStatus = "used" | "unused";

export type LicenseKeyCatalogOrganizationFilter =
  | "all"
  | "abaka-digital"
  | "bohol-island-state-university-main-campus"
  | "cebu-city-hall"
  | "philippine-national-police-region-7"
  | "department-of-social-welfare-and-development"
  | "tagbilaran-city-college"
  | "sm-prime-holdings";

export type LicenseKeyCatalogStatusFilter = "all" | LicenseKeyCatalogStatus;

export type LicenseKeyCatalogRow = {
  id: number;
  serialKey: string;
  username: string;
  company: string;
  companyKey: Exclude<LicenseKeyCatalogOrganizationFilter, "all">;
  department: string;
  generatedDate: string;
  expirationDate: string;
  status: LicenseKeyCatalogStatus;
};

export type LicenseKeyCatalogStatsView = {
  total: number;
  used: number;
  unused: number;
  totalHint: string;
  usedHint: string;
  unusedHint: string;
};

export const LICENSE_KEY_CATALOG_GLOBAL_STATS: LicenseKeyCatalogStatsView = {
  total: 30,
  used: 17,
  unused: 13,
  totalHint: "All generated keys across all companies",
  usedHint: "57% of total",
  unusedHint: "9 keys available/left",
};

export const LICENSE_KEY_CATALOG_ABAKA_STATS: LicenseKeyCatalogStatsView = {
  total: 10,
  used: 5,
  unused: 5,
  totalHint: "All generated keys - Abaka Digital",
  usedHint: "50% of Abaka Digital",
  unusedHint: "3 keys available/left",
};

export const LICENSE_KEY_CATALOG_TOTAL = LICENSE_KEY_CATALOG_GLOBAL_STATS.total;
export const LICENSE_KEY_CATALOG_PAGE_SIZE = 7;
export const LICENSE_KEY_CATALOG_ASSIGNED_COUNT = "10";

export const LICENSE_KEY_CATALOG_ORGANIZATIONS = [
  { value: "all" as const, label: "All Organization" },
  { value: "abaka-digital" as const, label: "Abaka Digital" },
  { value: "bohol-island-state-university-main-campus" as const, label: "BOHOL ISLAND STATE UNIVERSITY-MAIN CAMPUS" },
  { value: "cebu-city-hall" as const, label: "CEBU CITY HALL" },
  { value: "philippine-national-police-region-7" as const, label: "PHILIPPINE NATIONAL POLICE - REGION 7" },
  { value: "department-of-social-welfare-and-development" as const, label: "DEPARTMENT OF SOCIAL WELFARE AND DEVELOPMENT" },
  { value: "tagbilaran-city-college" as const, label: "TAGBILARAN CITY COLLEGE" },
  { value: "sm-prime-holdings" as const, label: "SM PRIME HOLDINGS" },
];

export const LICENSE_KEY_CATALOG_STATUS_OPTIONS = [
  { value: "all" as const, label: "All Status" },
  { value: "used" as const, label: "Used" },
  { value: "unused" as const, label: "Unused" },
];

const ABAKA_COMPANY = {
  company: "Abaka Digital",
  companyKey: "abaka-digital" as const,
};

const ALL_ORGANIZATION_PAGE_ONE: LicenseKeyCatalogRow[] = [
  {
    id: 1,
    serialKey: "BKD-QQ77-RR88-4F5B-5G7H",
    username: "tess.vega",
    ...ABAKA_COMPANY,
    department: "Finance",
    generatedDate: "Mar. 5, 2025",
    expirationDate: "Mar. 6, 2026",
    status: "used",
  },
  {
    id: 2,
    serialKey: "BKD-P2XN-BL9Z-4M7A-1K3D",
    username: "pat.ong",
    ...ABAKA_COMPANY,
    department: "IT",
    generatedDate: "Mar. 5, 2025",
    expirationDate: "Mar. 6, 2026",
    status: "used",
  },
  {
    id: 3,
    serialKey: "BKD-W4VB-RP6M-7N2Q-9X5Y",
    username: "luis.delacruz",
    ...ABAKA_COMPANY,
    department: "HR",
    generatedDate: "Mar. 5, 2025",
    expirationDate: "Mar. 6, 2026",
    status: "used",
  },
  {
    id: 4,
    serialKey: "BKD-T8M2-VL5K-3H7Q-4C9P",
    username: "maria.cruz",
    ...ABAKA_COMPANY,
    department: "Finance",
    generatedDate: "Mar. 5, 2025",
    expirationDate: "Mar. 6, 2026",
    status: "used",
  },
  {
    id: 5,
    serialKey: "BKD-J7R4-KN8V-2D6X-5H3F",
    username: "andrew.bautista",
    ...ABAKA_COMPANY,
    department: "Operations",
    generatedDate: "Mar. 5, 2025",
    expirationDate: "Mar. 6, 2026",
    status: "used",
  },
  {
    id: 6,
    serialKey: "BKD-G1B9-WQ4M-8L2P-6V7R",
    username: "jeffrey.torres",
    ...ABAKA_COMPANY,
    department: "Finance",
    generatedDate: "Mar. 5, 2025",
    expirationDate: "Mar. 6, 2026",
    status: "used",
  },
  {
    id: 7,
    serialKey: "BKD-Z5H3-TC8K-1M9V-4P6N",
    username: "kim.park",
    ...ABAKA_COMPANY,
    department: "Marketing",
    generatedDate: "Mar. 5, 2025",
    expirationDate: "Mar. 6, 2026",
    status: "used",
  },
];

const ABAKA_DIGITAL_FINANCE_USED: LicenseKeyCatalogRow[] = [
  {
    id: 101,
    serialKey: "BKD-QQ77-RR88-4F5B-5G7H",
    username: "tess.vega",
    ...ABAKA_COMPANY,
    department: "Finance",
    generatedDate: "Mar. 5, 2025",
    expirationDate: "Mar. 6, 2026",
    status: "used",
  },
  {
    id: 102,
    serialKey: "BKD-P2XN-BL9Z-4M7A-1K3D",
    username: "ken.flores",
    ...ABAKA_COMPANY,
    department: "Finance",
    generatedDate: "Mar. 5, 2025",
    expirationDate: "Mar. 6, 2026",
    status: "used",
  },
  {
    id: 103,
    serialKey: "BKD-W4VB-RP6M-7N2Q-9X5Y",
    username: "maria.cruz",
    ...ABAKA_COMPANY,
    department: "Finance",
    generatedDate: "Mar. 5, 2025",
    expirationDate: "Mar. 6, 2026",
    status: "used",
  },
  {
    id: 104,
    serialKey: "BKD-T8M2-VL5K-3H7Q-4C9P",
    username: "jeffrey.torres",
    ...ABAKA_COMPANY,
    department: "Finance",
    generatedDate: "Mar. 5, 2025",
    expirationDate: "Mar. 6, 2026",
    status: "used",
  },
  {
    id: 105,
    serialKey: "BKD-J7R4-KN8V-2D6X-5H3F",
    username: "nina.lopez",
    ...ABAKA_COMPANY,
    department: "Finance",
    generatedDate: "Mar. 5, 2025",
    expirationDate: "Mar. 6, 2026",
    status: "used",
  },
];

const EXTRA_USED_USERS = [
  { username: "carlo.mendez", department: "IT" },
  { username: "grace.tan", department: "HR" },
  { username: "diego.ramos", department: "Operations" },
  { username: "ella.santos", department: "Marketing" },
  { username: "miguel.reyes", department: "Finance" },
  { username: "sofia.garcia", department: "IT" },
  { username: "noah.flores", department: "HR" },
  { username: "ava.morales", department: "Operations" },
  { username: "ethan.cruz", department: "Marketing" },
  { username: "lara.santos", department: "Finance" },
];

const EXTRA_COMPANIES: Array<{
  company: string;
  companyKey: Exclude<LicenseKeyCatalogOrganizationFilter, "all">;
}> = [
  { company: "BOHOL ISLAND STATE UNIVERSITY-MAIN CAMPUS", companyKey: "bohol-island-state-university-main-campus" },
  { company: "CEBU CITY HALL", companyKey: "cebu-city-hall" },
  { company: "PHILIPPINE NATIONAL POLICE - REGION 7", companyKey: "philippine-national-police-region-7" },
  { company: "DEPARTMENT OF SOCIAL WELFARE AND DEVELOPMENT", companyKey: "department-of-social-welfare-and-development" },
  { company: "TAGBILARAN CITY COLLEGE", companyKey: "tagbilaran-city-college" },
  { company: "SM PRIME HOLDINGS", companyKey: "sm-prime-holdings" },
];

function serialKeyForId(id: number) {
  const segments = [
    "BKD",
    `${String.fromCharCode(65 + (id % 26))}${id % 10}${String.fromCharCode(65 + ((id * 2) % 26))}${String.fromCharCode(65 + ((id * 3) % 26))}`,
    `${String.fromCharCode(65 + ((id * 4) % 26))}${id % 10}${String.fromCharCode(65 + ((id * 5) % 26))}`,
    `${id % 10}${String.fromCharCode(65 + ((id * 6) % 26))}${id % 10}${String.fromCharCode(65 + ((id * 7) % 26))}`,
    `${String.fromCharCode(65 + ((id * 8) % 26))}${id % 10}${String.fromCharCode(65 + ((id * 9) % 26))}`,
  ];
  return segments.join("-");
}

function getSyntheticRow(index: number): LicenseKeyCatalogRow {
  const syntheticIndex = index - ALL_ORGANIZATION_PAGE_ONE.length;
  const id = index + 1;
  const isUsed = id <= LICENSE_KEY_CATALOG_GLOBAL_STATS.used;

  if (isUsed) {
    const template = EXTRA_USED_USERS[syntheticIndex % EXTRA_USED_USERS.length];
    const company =
      syntheticIndex % 3 === 0
        ? EXTRA_COMPANIES[syntheticIndex % EXTRA_COMPANIES.length]
        : ABAKA_COMPANY;

    return {
      id,
      serialKey: serialKeyForId(id),
      username: template.username,
      company: company.company,
      companyKey: company.companyKey,
      department: template.department,
      generatedDate: "Mar. 5, 2025",
      expirationDate: "Mar. 6, 2026",
      status: "used",
    };
  }

  const company = EXTRA_COMPANIES[syntheticIndex % EXTRA_COMPANIES.length];

  return {
    id,
    serialKey: serialKeyForId(id),
    username: "—",
    company: company.company,
    companyKey: company.companyKey,
    department: "—",
    generatedDate: "Mar. 4, 2025",
    expirationDate: "Mar. 4, 2026",
    status: "unused",
  };
}

export function getLicenseKeyCatalogRow(index: number): LicenseKeyCatalogRow {
  if (index >= 0 && index < ALL_ORGANIZATION_PAGE_ONE.length) {
    return ALL_ORGANIZATION_PAGE_ONE[index];
  }

  return getSyntheticRow(index);
}

export function buildLicenseKeyCatalog(total = LICENSE_KEY_CATALOG_TOTAL): LicenseKeyCatalogRow[] {
  return Array.from({ length: total }, (_, index) => getLicenseKeyCatalogRow(index));
}

export function getLicenseKeyCatalogStats(
  organization: LicenseKeyCatalogOrganizationFilter
): LicenseKeyCatalogStatsView {
  if (organization === "abaka-digital") {
    return LICENSE_KEY_CATALOG_ABAKA_STATS;
  }

  return LICENSE_KEY_CATALOG_GLOBAL_STATS;
}

export function getLicenseKeyCatalogDepartmentLabel(
  organization: LicenseKeyCatalogOrganizationFilter
): string {
  return organization === "abaka-digital" ? "Finance" : "All Department";
}

export function filterLicenseKeyCatalogRows(
  rows: LicenseKeyCatalogRow[],
  searchQuery: string,
  organization: LicenseKeyCatalogOrganizationFilter,
  status: LicenseKeyCatalogStatusFilter
): LicenseKeyCatalogRow[] {
  const normalized = searchQuery.trim().toLowerCase();

  if (organization === "abaka-digital" && status === "used" && !normalized) {
    return ABAKA_DIGITAL_FINANCE_USED;
  }

  return rows.filter((row) => {
    if (organization !== "all" && row.companyKey !== organization) {
      return false;
    }

    if (status !== "all" && row.status !== status) {
      return false;
    }

    if (!normalized) {
      return true;
    }

    return (
      row.serialKey.toLowerCase().includes(normalized) ||
      row.username.toLowerCase().includes(normalized) ||
      row.company.toLowerCase().includes(normalized) ||
      row.department.toLowerCase().includes(normalized)
    );
  });
}

export function getLicenseKeyCatalogTotalEntries(
  organization: LicenseKeyCatalogOrganizationFilter,
  filteredCount: number,
  hasSearch: boolean
): number {
  if (hasSearch) {
    return filteredCount;
  }

  if (organization === "abaka-digital") {
    return LICENSE_KEY_CATALOG_ABAKA_STATS.total;
  }

  return LICENSE_KEY_CATALOG_GLOBAL_STATS.total;
}
