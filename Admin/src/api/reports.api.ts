import type { ReportSummary } from "../types";
import { downloadCsvInBrowser } from "../utils/downloadCsv";
import api from "./axios";

export const reportsApi = {
  summary: () => api.get<ReportSummary>("/reports/summary").then((r) => r.data),

  export: async (type = "csv") => {
    const data = await api
      .get<{ type: string; rows: Record<string, unknown>[] }>("/reports/export", {
        params: { type },
      })
      .then((r) => r.data);

    const rows = data.rows ?? [];
    if (rows.length === 0) {
      const summary = await reportsApi.summary();
      const csv = [
        "metric,value",
        `totalUsers,${summary.totalUsers}`,
        `activeKeys,${summary.activeKeys}`,
        `registeredDevices,${summary.registeredDevices}`,
      ].join("\n");
      downloadCsvInBrowser(csv, "admin-report.csv", "text/csv");
      return;
    }

    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((row) => headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")),
    ].join("\n");
    downloadCsvInBrowser(csv, "admin-report.csv", "text/csv");
  },
};
