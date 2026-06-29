export type KeyExpiryThreshold = "none" | "green" | "amber" | "red" | "expired";

export type KeyExpiryState = {
  daysRemaining: number | null;
  daysExpired: number | null;
  percentConsumed: number | null;
  threshold: KeyExpiryThreshold;
  isExpired: boolean;
  hasExpiry: boolean;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function computeKeyExpiryState(
  expiresAt: Date | string | null | undefined,
  durationDays: number | null | undefined,
  now: Date = new Date(),
): KeyExpiryState {
  if (!expiresAt) {
    return {
      daysRemaining: null,
      daysExpired: null,
      percentConsumed: null,
      threshold: "none",
      isExpired: false,
      hasExpiry: false,
    };
  }

  const expiry = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  const diffMs = expiry.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / MS_PER_DAY);

  if (daysRemaining <= 0) {
    return {
      daysRemaining: 0,
      daysExpired: Math.abs(daysRemaining),
      percentConsumed: 100,
      threshold: "expired",
      isExpired: true,
      hasExpiry: true,
    };
  }

  const duration = durationDays && durationDays > 0 ? durationDays : null;
  const percentConsumed =
    duration != null
      ? Math.min(100, Math.max(0, ((duration - daysRemaining) / duration) * 100))
      : null;

  let threshold: KeyExpiryThreshold = "green";
  if (daysRemaining <= 7) {
    threshold = "red";
  } else if (percentConsumed != null && percentConsumed >= 50) {
    threshold = "amber";
  }

  return {
    daysRemaining,
    daysExpired: null,
    percentConsumed,
    threshold,
    isExpired: false,
    hasExpiry: true,
  };
}

export function addDays(base: Date, days: number) {
  return new Date(base.getTime() + days * MS_PER_DAY);
}

export function maskSerialKey(serialKey: string) {
  const trimmed = serialKey.trim();
  if (trimmed.length <= 4) return trimmed;
  const lastFour = trimmed.slice(-4);
  const maskedLength = Math.max(0, trimmed.length - 4);
  const groups = Math.ceil(maskedLength / 4);
  const masked = Array.from({ length: groups }, () => "••••").join("-");
  return masked ? `${masked}-${lastFour}` : lastFour;
}
