"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeDeviceName = normalizeDeviceName;
exports.isVirtualPrinterName = isVirtualPrinterName;
exports.deviceNamesMatch = deviceNamesMatch;
exports.scoreDeviceNameMatch = scoreDeviceNameMatch;
exports.findBestMatchingDevice = findBestMatchingDevice;
exports.sortDevicesByPreferredName = sortDevicesByPreferredName;
function normalizeDeviceName(value) {
    return value
        .toLowerCase()
        .replace(/^wia\s+/i, "")
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}
function significantTokens(value) {
    const stopWords = new Set(["series", "ser", "printer", "scan", "scanner", "copier", "all", "in", "one"]);
    return normalizeDeviceName(value)
        .split(/\s+/)
        .filter((token) => token.length > 1 && !stopWords.has(token));
}
function isVirtualPrinterName(name) {
    const normalized = normalizeDeviceName(name);
    return (normalized.includes("print to pdf") ||
        normalized.includes("microsoft xps") ||
        normalized.includes("onenote") ||
        normalized.includes("fax") ||
        normalized.includes("send to"));
}
function deviceNamesMatch(left, right) {
    const a = normalizeDeviceName(left);
    const b = normalizeDeviceName(right);
    if (!a || !b)
        return false;
    if (a === b)
        return true;
    if (a.includes(b) || b.includes(a))
        return true;
    const tokensA = significantTokens(left);
    const tokensB = significantTokens(right);
    if (tokensA.length === 0 || tokensB.length === 0)
        return false;
    const overlap = tokensA.filter((token) => tokensB.some((other) => other.startsWith(token) || token.startsWith(other)));
    if (overlap.length >= 2)
        return true;
    if (overlap.length === 1 && tokensA.length === 1 && tokensB.length === 1)
        return true;
    const brandA = tokensA[0];
    const brandB = tokensB[0];
    return brandA === brandB && overlap.length >= 1;
}
function scoreDeviceNameMatch(candidate, target) {
    if (!target.trim())
        return 0;
    if (!deviceNamesMatch(candidate, target))
        return 0;
    const candidateTokens = significantTokens(candidate);
    const targetTokens = significantTokens(target);
    const overlap = candidateTokens.filter((token) => targetTokens.some((other) => other.startsWith(token) || token.startsWith(other)));
    let score = overlap.length * 10;
    if (normalizeDeviceName(candidate) === normalizeDeviceName(target))
        score += 50;
    if (normalizeDeviceName(candidate).includes(normalizeDeviceName(target)))
        score += 20;
    if (isVirtualPrinterName(candidate))
        score -= 30;
    return score;
}
function findBestMatchingDevice(candidates, targetName) {
    let best = null;
    let bestScore = 0;
    for (const candidate of candidates) {
        const score = scoreDeviceNameMatch(candidate.name, targetName);
        if (score > bestScore) {
            best = candidate;
            bestScore = score;
        }
    }
    return bestScore > 0 ? best : null;
}
function sortDevicesByPreferredName(devices, preferredName) {
    if (!preferredName?.trim())
        return devices;
    return [...devices].sort((left, right) => {
        const leftScore = scoreDeviceNameMatch(left.name, preferredName);
        const rightScore = scoreDeviceNameMatch(right.name, preferredName);
        if (leftScore !== rightScore)
            return rightScore - leftScore;
        if (isVirtualPrinterName(left.name) !== isVirtualPrinterName(right.name)) {
            return isVirtualPrinterName(left.name) ? 1 : -1;
        }
        return left.name.localeCompare(right.name);
    });
}
