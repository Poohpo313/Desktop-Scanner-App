export type KeyExpiryThreshold = "none" | "green" | "amber" | "red" | "expired";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function computeKeyExpiryDisplay(
  expiresAt?: string | null,
  durationDays?: number | null,
  now = new Date(),
) {
  if (!expiresAt) {
    return { daysRemaining: null, threshold: "none" as KeyExpiryThreshold, label: "Never", isExpired: false };
  }

  const expiry = new Date(expiresAt);
  const diffMs = expiry.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / MS_PER_DAY);

  if (daysRemaining <= 0) {
    return { daysRemaining: 0, threshold: "expired" as KeyExpiryThreshold, label: "Expired", isExpired: true };
  }

  const duration = durationDays && durationDays > 0 ? durationDays : null;
  const percentConsumed =
    duration != null ? Math.min(100, Math.max(0, ((duration - daysRemaining) / duration) * 100)) : null;

  let threshold: KeyExpiryThreshold = "green";
  if (daysRemaining <= 7) threshold = "red";
  else if (percentConsumed != null && percentConsumed >= 50) threshold = "amber";

  return {
    daysRemaining,
    threshold,
    label: `${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`,
    isExpired: false,
  };
}

export function addDaysToDate(base: Date, days: number) {
  return new Date(base.getTime() + days * MS_PER_DAY);
}

export function previewNewExpiry(
  expiresAt: string | null | undefined,
  isExpired: boolean,
  addDays: number,
) {
  const anchor =
    expiresAt && !isExpired ? new Date(expiresAt) : new Date();
  return addDaysToDate(anchor, addDays);
}
