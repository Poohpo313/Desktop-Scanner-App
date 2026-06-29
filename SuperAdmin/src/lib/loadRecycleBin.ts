type SettledResult<T> = { ok: true; data: T } | { ok: false };

export async function settleRecycleBinRequest<T>(
  request: Promise<T>,
  fallback: T,
): Promise<SettledResult<T>> {
  try {
    return { ok: true, data: await request };
  } catch {
    return { ok: false };
  }
}

export function recycleBinResult<T>(result: SettledResult<T>, fallback: T): T {
  return result.ok ? result.data : fallback;
}

export function hasRecycleBinFailures(results: Array<{ ok: boolean }>) {
  return results.some((result) => !result.ok);
}
