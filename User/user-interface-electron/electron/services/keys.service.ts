import { query, queryOne } from "./db.service";

const KEY_PATTERN =
  /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

type LocalKeyRow = {
  serial_id: number;
  serial_key: string;
  assigned_to: number | null;
  status: string;
  generated_at: Date | string | null;
  used_at: Date | string | null;
  expires_at: Date | string | null;
  duration_days: number | null;
  extension_count: number | null;
};

function maskSerialKey(serialKey: string) {
  const trimmed = serialKey.trim();
  if (trimmed.length <= 4) return trimmed;
  const lastFour = trimmed.slice(-4);
  const maskedLength = Math.max(0, trimmed.length - 4);
  const groups = Math.ceil(maskedLength / 4);
  const masked = Array.from({ length: groups }, () => "••••").join("-");
  return masked ? `${masked}-${lastFour}` : lastFour;
}

function computeLocalExpiryState(
  expiresAt: Date | string | null | undefined,
  durationDays: number | null | undefined,
) {
  if (!expiresAt) {
    return {
      daysRemaining: null,
      daysExpired: null,
      threshold: "none",
      isExpired: false,
      hasExpiry: false,
    };
  }

  const expiry = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  const diffMs = expiry.getTime() - Date.now();
  const daysRemaining = Math.ceil(diffMs / MS_PER_DAY);

  if (daysRemaining <= 0) {
    return {
      daysRemaining: 0,
      daysExpired: Math.abs(daysRemaining),
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

  let threshold = "green";
  if (daysRemaining <= 7) threshold = "red";
  else if (percentConsumed != null && percentConsumed >= 50) threshold = "amber";

  return {
    daysRemaining,
    daysExpired: null,
    threshold,
    isExpired: false,
    hasExpiry: true,
  };
}

export const keysService = {
  validateFormat(serialKey: string) {
    return KEY_PATTERN.test(serialKey.trim());
  },

  async findKey(serialKey: string) {
    const normalized = serialKey.trim();
    return queryOne(
      "SELECT * FROM serial_keys WHERE LOWER(serial_key) = LOWER($1)",
      [normalized],
    );
  },

  async markUsed(serialKey: string, userId: number) {
    await query(
      "UPDATE serial_keys SET status = 'used', assigned_to = $1, used_at = NOW() WHERE LOWER(serial_key) = LOWER($2)",
      [userId, serialKey.trim()],
    );
  },

  async syncKeyExpiryFromOnline(
    userId: number,
    payload: {
      key: {
        expiresAt: string | null;
        durationDays: number | null;
        extensionCount?: number;
      };
    },
  ) {
    const row = await queryOne<{ serial_key: string }>(
      `SELECT serial_key FROM users WHERE user_id = $1 AND deleted_at IS NULL`,
      [userId],
    );
    if (!row?.serial_key) return;

    await query(
      `UPDATE serial_keys
       SET expires_at = $1,
           duration_days = $2,
           extension_count = COALESCE($3, extension_count)
       WHERE LOWER(serial_key) = LOWER($4)`,
      [
        payload.key.expiresAt,
        payload.key.durationDays,
        payload.key.extensionCount ?? null,
        row.serial_key.trim(),
      ],
    );
  },

  async getLocalKeyStatus(userId: number) {
    const key = await queryOne<LocalKeyRow>(
      `SELECT sk.serial_id, sk.serial_key, sk.assigned_to, sk.status, sk.generated_at, sk.used_at,
              sk.expires_at, sk.duration_days, sk.extension_count
       FROM serial_keys sk
       INNER JOIN users u ON u.user_id = $1
       WHERE sk.assigned_to = $1
          OR (
            TRIM(COALESCE(u.serial_key, '')) <> ''
            AND LOWER(TRIM(sk.serial_key)) = LOWER(TRIM(u.serial_key))
          )
       ORDER BY sk.serial_id DESC
       LIMIT 1`,
      [userId],
    );

    if (!key) {
      return { success: false as const, error: "No serial key is assigned to your account." };
    }

    const expiry = computeLocalExpiryState(key.expires_at, key.duration_days);
    let statusLabel: "Active" | "Expiring Soon" | "Expired" = "Active";
    if (expiry.isExpired) statusLabel = "Expired";
    else if (expiry.threshold === "amber" || expiry.threshold === "red") statusLabel = "Expiring Soon";

    return {
      success: true as const,
      data: {
        key: {
          serialKeyMasked: maskSerialKey(key.serial_key),
          statusLabel,
          activatedOn: key.used_at ?? key.generated_at,
          expiresAt: key.expires_at,
          durationDays: key.duration_days,
          extensionCount: key.extension_count ?? 0,
          extensionStatus: null,
          renewalStatus: null,
          trial: false,
          ...expiry,
        },
        assignedAdmin: null,
        pendingRequest: null,
      },
    };
  },
};
