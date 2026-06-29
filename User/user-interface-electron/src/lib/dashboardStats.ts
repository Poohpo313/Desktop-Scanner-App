import type { SaveModeId } from "../components/settings/settingsData";
import type { SavedDocument } from "./documents";

export type DashboardTrendDirection = "up" | "down" | "neutral";

export type DashboardTrend = {
  direction: DashboardTrendDirection;
  label: string;
};

const DEFAULT_PERIOD_DAYS = 7;

function sumInWindow(
  documents: SavedDocument[],
  getMetric: (doc: SavedDocument) => number,
  startMs: number,
  endMs: number,
): number {
  return documents.reduce((total, doc) => {
    const timestamp = new Date(doc.modifiedAt).getTime();
    if (timestamp >= startMs && timestamp < endMs) {
      return total + getMetric(doc);
    }
    return total;
  }, 0);
}

export function computeDashboardTrend(
  documents: SavedDocument[],
  getMetric: (doc: SavedDocument) => number,
  periodDays = DEFAULT_PERIOD_DAYS,
): DashboardTrend {
  const now = Date.now();
  const periodMs = periodDays * 24 * 60 * 60 * 1000;
  const currentStart = now - periodMs;
  const previousStart = now - periodMs * 2;

  const currentTotal = sumInWindow(documents, getMetric, currentStart, now);
  const previousTotal = sumInWindow(documents, getMetric, previousStart, currentStart);

  if (previousTotal === 0 && currentTotal === 0) {
    return {
      direction: "neutral",
      label: `No change vs previous ${periodDays} days`,
    };
  }

  if (previousTotal === 0) {
    return {
      direction: "up",
      label: `+100% vs previous ${periodDays} days`,
    };
  }

  const change = Math.round(((currentTotal - previousTotal) / previousTotal) * 100);
  if (change === 0) {
    return {
      direction: "neutral",
      label: `No change vs previous ${periodDays} days`,
    };
  }

  if (change > 0) {
    return {
      direction: "up",
      label: `+${change}% vs previous ${periodDays} days`,
    };
  }

  return {
    direction: "down",
    label: `${change}% vs previous ${periodDays} days`,
  };
}

export function emptyMetricTrend(label: string): DashboardTrend {
  return { direction: "neutral", label };
}

export function dashboardSaveModeLabel(mode: SaveModeId): string {
  if (mode === "auto-save" || mode === "multiple-folders") {
    return "Auto-save / Multi-folder";
  }
  if (mode === "ask-every-time") {
    return "Ask every time";
  }
  return "Local + cloud sync";
}

export function devicesConnectedTrend(connectedCount: number): DashboardTrend {
  if (connectedCount === 0) {
    return { direction: "neutral", label: "No devices connected yet" };
  }
  return { direction: "neutral", label: "No change vs previous 7 days" };
}
