export function normalizeDeviceName(value: string) {
  return value
    .toLowerCase()
    .replace(/^wia\s+/i, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function significantTokens(value: string) {
  const stopWords = new Set([
    "series",
    "ser",
    "printer",
    "scan",
    "scanner",
    "copier",
    "all",
    "in",
    "one",
    "wia",
    "imaging",
    "device",
  ]);
  return normalizeDeviceName(value)
    .split(/\s+/)
    .filter((token) => token.length > 1 && !stopWords.has(token));
}

export function deviceNamesMatch(left: string, right: string) {
  const a = normalizeDeviceName(left);
  const b = normalizeDeviceName(right);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;

  const tokensA = significantTokens(left);
  const tokensB = significantTokens(right);
  if (tokensA.length === 0 || tokensB.length === 0) return false;

  const overlap = tokensA.filter((token) =>
    tokensB.some((other) => other.startsWith(token) || token.startsWith(other)),
  );

  if (overlap.length >= 2) return true;
  if (overlap.length === 1 && tokensA.length === 1 && tokensB.length === 1) return true;

  const brandA = tokensA[0];
  const brandB = tokensB[0];
  return brandA === brandB && overlap.length >= 1;
}

export function preferScannerName(current: string, candidate: string) {
  const currentWia = current.toLowerCase().includes("wia");
  const candidateWia = candidate.toLowerCase().includes("wia");
  if (candidateWia && !currentWia) return candidate;
  return current;
}
