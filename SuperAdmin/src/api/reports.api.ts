import type { ReportSummary } from "../types";
import api from "./axios";

export const reportsApi = {
  summary: () => api.get<ReportSummary>("/reports/summary").then((r) => r.data),
};
