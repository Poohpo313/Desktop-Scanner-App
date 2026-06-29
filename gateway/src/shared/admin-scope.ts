import type { JwtPayload } from "./types/index";

export type AdminScope = {
  company: string;
  /** Primary department assignment for this admin (single department scoping). */
  department: string;
  departments: string[];
};

export type ScopedActor = JwtPayload & {
  sub?: number;
  userId?: number;
  company?: string | null;
  department?: string | null;
};

export function isSuperAdmin(role?: string): boolean {
  return role === "superadmin";
}

export function normalizeScopeValue(value?: string | null): string {
  return value?.trim().toLowerCase() ?? "";
}

/** Resolve authenticated account id from JWT user object (strategy exposes userId, not sub). */
export function resolveActorId(actor: ScopedActor): number {
  return actor.userId ?? actor.sub ?? 0;
}

export function buildAdminScope(admin: {
  company?: string | null;
  department?: string | null;
  departments?: string[] | null;
} | null): AdminScope | null {
  if (!admin) return null;
  const company = admin.company?.trim() ?? "";
  if (!company) return null;

  const assignedDepartment =
    admin.department?.trim() ||
    (Array.isArray(admin.departments)
      ? admin.departments.map((value) => value?.trim()).find(Boolean)
      : undefined) ||
    "";

  return {
    company,
    department: assignedDepartment,
    departments: assignedDepartment ? [assignedDepartment] : [],
  };
}

export function matchesAdminScope(
  scope: AdminScope | null,
  record: { company?: string | null; department?: string | null },
): boolean {
  if (!scope) return false;
  if (normalizeScopeValue(record.company) !== normalizeScopeValue(scope.company)) {
    return false;
  }
  if (!scope.department) return false;
  return normalizeScopeValue(record.department) === normalizeScopeValue(scope.department);
}

export function appendCompanyScope(
  sql: string,
  scope: AdminScope | null,
  companyColumn: string,
  params: unknown[],
): string {
  if (!scope?.company) return `${sql} AND 1=0`;
  params.push(scope.company);
  return `${sql} AND LOWER(TRIM(COALESCE(${companyColumn}, ''))) = LOWER(TRIM($${params.length}))`;
}

export function appendDepartmentScope(
  sql: string,
  scope: AdminScope | null,
  departmentColumn: string,
  params: unknown[],
  options?: { requireDepartments?: boolean },
): string {
  const departments = scope?.departments?.map((value) => value?.trim()).filter(Boolean) ?? [];

  if (!departments.length) {
    if (options?.requireDepartments) {
      return `${sql} AND 1=0`;
    }
    return sql;
  }

  const conditions = departments.map((department) => {
    params.push(department);
    return `LOWER(TRIM(COALESCE(${departmentColumn}, ''))) = LOWER(TRIM($${params.length}))`;
  });

  return `${sql} AND (${conditions.join(" OR ")})`;
}

export function appendAdminRecordScope(
  sql: string,
  scope: AdminScope | null,
  companyColumn: string,
  departmentColumn: string,
  params: unknown[],
): string {
  let next = appendCompanyScope(sql, scope, companyColumn, params);
  return appendDepartmentScope(next, scope, departmentColumn, params, {
    requireDepartments: true,
  });
}
