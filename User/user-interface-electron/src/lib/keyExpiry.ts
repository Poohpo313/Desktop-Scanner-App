export type KeyExpiryThreshold = "none" | "green" | "amber" | "red" | "expired";

export function computeKeyExpiryDisplay(
  expiresAt?: string | null,
  durationDays?: number | null,
  now = new Date(),
) {
  if (!expiresAt) {
    return { daysRemaining: null, threshold: "none" as KeyExpiryThreshold, isExpired: false };
  }

  const expiry = new Date(expiresAt);
  const daysRemaining = Math.ceil((expiry.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

  if (daysRemaining <= 0) {
    return { daysRemaining: 0, threshold: "expired" as KeyExpiryThreshold, isExpired: true };
  }

  const duration = durationDays && durationDays > 0 ? durationDays : null;
  const percentConsumed =
    duration != null ? Math.min(100, Math.max(0, ((duration - daysRemaining) / duration) * 100)) : null;

  let threshold: KeyExpiryThreshold = "green";
  if (daysRemaining <= 7) threshold = "red";
  else if (percentConsumed != null && percentConsumed >= 50) threshold = "amber";

  return { daysRemaining, threshold, isExpired: false };
}

export function previewNewExpiry(expiresAt: string | null | undefined, isExpired: boolean, days: number) {
  const anchor = expiresAt && !isExpired ? new Date(expiresAt) : new Date();
  return new Date(anchor.getTime() + days * 24 * 60 * 60 * 1000);
}
