import type { RevocationRecord } from "../types";

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function normalizeRevocationRecord(raw: Record<string, unknown>): RevocationRecord {
  const serialKey = asString(raw.serialKey) || asString(raw.serial_key);
  const requestStatus = asString(raw.requestStatus) || asString(raw.request_status) || null;

  return {
    recordId: asString(raw.recordId) || asString(raw.record_id) || `revocation-${Math.random()}`,
    serialId: asNumber(raw.serialId ?? raw.serial_id),
    deviceId: asNumber(raw.deviceId ?? raw.device_id),
    serialKey: serialKey || "-",
    status: asString(raw.status) || undefined,
    generatedAt: asString(raw.generatedAt) || asString(raw.generated_at) || undefined,
    revokedAt: asString(raw.revokedAt) || asString(raw.revoked_at) || undefined,
    company: asString(raw.company) || null,
    department: asString(raw.department) || null,
    username: asString(raw.username) || null,
    firstName: asString(raw.firstName) || asString(raw.first_name) || null,
    lastName: asString(raw.lastName) || asString(raw.last_name) || null,
    action: asString(raw.action) || null,
    reason: asString(raw.reason) || null,
    revokedByUsername: asString(raw.revokedByUsername) || asString(raw.revoked_by_username) || null,
    revokedByFirstName: asString(raw.revokedByFirstName) || asString(raw.revoked_by_first_name) || null,
    revokedByLastName: asString(raw.revokedByLastName) || asString(raw.revoked_by_last_name) || null,
    revokedByRole: asString(raw.revokedByRole) || asString(raw.revoked_by_role) || null,
    requestId: asNumber(raw.requestId ?? raw.request_id),
    requestStatus,
  };
}

export function isActionableRevocationRecord(record: RevocationRecord) {
  if (record.requestStatus === "approved") return false;

  if (record.requestStatus === "pending" && record.requestId) {
    return Boolean(
      (record.serialKey && record.serialKey !== "-") || record.serialId || record.deviceId,
    );
  }

  if (record.action === "device.revoked" || record.action === "key.revoked") {
    return Boolean(record.serialId || record.deviceId);
  }

  return false;
}

export function normalizeRevocationList(rows: unknown): RevocationRecord[] {
  if (!Array.isArray(rows)) return [];

  return rows
    .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object")
    .map((row) => normalizeRevocationRecord(row))
    .filter(isActionableRevocationRecord);
}
