import type { DateRangeValue } from "../components/ModernDatePicker";

export const USER_REGISTRATION_STATS = {
  assignedLicenseKeys: 1924,
  registeredUsers: 218,
  activeAccounts: 1706,
} as const;

export const USER_REGISTRATION_TOTAL = 1842;
export const USER_REGISTRATION_PAGE_SIZE = 6;

export const USER_REGISTRATION_ORGANIZATIONS = [
  { value: "all", label: "Organization" },
  { value: "bohol-island-state-university-main-campus", label: "BOHOL ISLAND STATE UNIVERSITY-MAIN CAMPUS" },
  { value: "cebu-city-hall", label: "CEBU CITY HALL" },
  { value: "philippine-national-police-region-7", label: "PHILIPPINE NATIONAL POLICE - REGION 7" },
  { value: "department-of-social-welfare-and-development", label: "DEPARTMENT OF SOCIAL WELFARE AND DEVELOPMENT" },
  { value: "tagbilaran-city-college", label: "TAGBILARAN CITY COLLEGE" },
  { value: "sm-prime-holdings", label: "SM PRIME HOLDINGS" },
] as const;

export type UserRegistrationOrganizationFilter =
  (typeof USER_REGISTRATION_ORGANIZATIONS)[number]["value"];

export type UserRegistrationRow = {
  id: number;
  name: string;
  username: string;
  initials: string;
  organization: string;
  organizationKey: Exclude<UserRegistrationOrganizationFilter, "all">;
  department: string;
  serialKey: string;
  status: "active";
  registeredDate: string;
};

const MOCKUP_ROWS: UserRegistrationRow[] = [
  {
    id: 1,
    name: "John Doe",
    username: "johndoe",
    initials: "JD",
    organization: "BOHOL ISLAND STATE UNIVERSITY-MAIN CAMPUS",
    organizationKey: "bohol-island-state-university-main-campus",
    department: "Registrar",
    serialKey: "DS-7F3X-01.2M",
    status: "active",
    registeredDate: "2025-06-24",
  },
  {
    id: 2,
    name: "Alice Smith",
    username: "a.smith",
    initials: "AS",
    organization: "CEBU CITY HALL",
    organizationKey: "cebu-city-hall",
    department: "Finance",
    serialKey: "DS-A82K-94.PQ",
    status: "active",
    registeredDate: "2025-06-22",
  },
  {
    id: 3,
    name: "Robert Brown",
    username: "robrown",
    initials: "RB",
    organization: "PHILIPPINE NATIONAL POLICE - REGION 7",
    organizationKey: "philippine-national-police-region-7",
    department: "Records",
    serialKey: "DS-R92B-10.KL",
    status: "active",
    registeredDate: "2025-06-21",
  },
  {
    id: 4,
    name: "Maria Cruz",
    username: "mariacruz",
    initials: "MC",
    organization: "DEPARTMENT OF SOCIAL WELFARE AND DEVELOPMENT",
    organizationKey: "department-of-social-welfare-and-development",
    department: "Guidance",
    serialKey: "DS-Z19M-63.RT",
    status: "active",
    registeredDate: "2025-06-20",
  },
  {
    id: 5,
    name: "Liam Parker",
    username: "liam.parker123",
    initials: "LP",
    organization: "TAGBILARAN CITY COLLEGE",
    organizationKey: "tagbilaran-city-college",
    department: "Library",
    serialKey: "DS-L73A-22.WX",
    status: "active",
    registeredDate: "2025-06-19",
  },
  {
    id: 6,
    name: "Ella Reyes",
    username: "ella.rey3s",
    initials: "ER",
    organization: "SM PRIME HOLDINGS",
    organizationKey: "sm-prime-holdings",
    department: "Admissions",
    serialKey: "DS-Q91X-88.MN",
    status: "active",
    registeredDate: "2025-06-18",
  },
];

const GENERATED_TEMPLATES: Array<
  Pick<UserRegistrationRow, "organization" | "organizationKey" | "department">
> = [
  {
    organization: "BOHOL ISLAND STATE UNIVERSITY-MAIN CAMPUS",
    organizationKey: "bohol-island-state-university-main-campus",
    department: "Registrar",
  },
  {
    organization: "CEBU CITY HALL",
    organizationKey: "cebu-city-hall",
    department: "Finance",
  },
  {
    organization: "PHILIPPINE NATIONAL POLICE - REGION 7",
    organizationKey: "philippine-national-police-region-7",
    department: "Records",
  },
  {
    organization: "DEPARTMENT OF SOCIAL WELFARE AND DEVELOPMENT",
    organizationKey: "department-of-social-welfare-and-development",
    department: "Guidance",
  },
  {
    organization: "TAGBILARAN CITY COLLEGE",
    organizationKey: "tagbilaran-city-college",
    department: "Library",
  },
  {
    organization: "SM PRIME HOLDINGS",
    organizationKey: "sm-prime-holdings",
    department: "Admissions",
  },
];

const EXTRA_FIRST = ["Carlos", "Diana", "Ethan", "Fiona", "Gabriel", "Hannah", "Isaac", "Jasmine"];
const EXTRA_LAST = ["Santos", "Reyes", "Garcia", "Mendoza", "Flores", "Ramos", "Torres", "Castillo"];

function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function usernameFor(firstName: string, lastName: string, id: number) {
  const base = `${firstName.charAt(0).toLowerCase()}.${lastName.toLowerCase()}`;
  return id % 4 === 0 ? `${firstName.toLowerCase()}${id}` : base.replace(/\s/g, "");
}

function serialKeyForId(id: number) {
  const left = `${String.fromCharCode(65 + (id % 26))}${id % 10}${String.fromCharCode(65 + ((id * 3) % 26))}${String.fromCharCode(65 + ((id * 5) % 26))}`;
  const right = `${String((id * 7) % 100).padStart(2, "0")}.${String.fromCharCode(65 + ((id * 2) % 26))}${String.fromCharCode(65 + ((id * 4) % 26))}`;
  return `DS-${left}-${right}`;
}

function registeredDateForIndex(index: number) {
  const day = Math.max(1, 24 - (index % 24));
  return `2025-06-${String(day).padStart(2, "0")}`;
}

export function getUserRegistrationRow(index: number): UserRegistrationRow {
  if (index >= 0 && index < MOCKUP_ROWS.length) {
    return MOCKUP_ROWS[index];
  }

  const syntheticIndex = index - MOCKUP_ROWS.length;
  const id = index + 1;
  const firstName = EXTRA_FIRST[syntheticIndex % EXTRA_FIRST.length];
  const lastName = EXTRA_LAST[(syntheticIndex * 2) % EXTRA_LAST.length];
  const name = `${firstName} ${lastName}`;
  const template = GENERATED_TEMPLATES[syntheticIndex % GENERATED_TEMPLATES.length];

  return {
    id,
    name,
    username: usernameFor(firstName, lastName, id),
    initials: initialsFor(name),
    organization: template.organization,
    organizationKey: template.organizationKey,
    department: template.department,
    serialKey: serialKeyForId(id),
    status: "active",
    registeredDate: registeredDateForIndex(syntheticIndex),
  };
}

export function buildUserRegistrationCatalog(total = USER_REGISTRATION_TOTAL): UserRegistrationRow[] {
  return Array.from({ length: total }, (_, index) => getUserRegistrationRow(index));
}

function matchesDateRange(date: string, range: DateRangeValue) {
  if (!range.start) {
    return true;
  }

  const end = range.end || range.start;
  const min = range.start <= end ? range.start : end;
  const max = range.start <= end ? end : range.start;
  return date >= min && date <= max;
}

export function filterUserRegistrationRows(
  rows: UserRegistrationRow[],
  query: string,
  organization: UserRegistrationOrganizationFilter,
  dateRange: DateRangeValue
): UserRegistrationRow[] {
  const normalized = query.trim().toLowerCase();

  return rows.filter((row) => {
    if (organization !== "all" && row.organizationKey !== organization) {
      return false;
    }

    if (!matchesDateRange(row.registeredDate, dateRange)) {
      return false;
    }

    if (!normalized) {
      return true;
    }

    return (
      row.name.toLowerCase().includes(normalized) ||
      row.username.toLowerCase().includes(normalized) ||
      row.organization.toLowerCase().includes(normalized) ||
      row.department.toLowerCase().includes(normalized) ||
      row.serialKey.toLowerCase().includes(normalized)
    );
  });
}
