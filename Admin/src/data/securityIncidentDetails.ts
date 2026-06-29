export type SecurityIncidentDetails = {
  incidentId: string;
  priority: "high" | "medium" | "low";
  priorityLabel: string;
  title: string;
  macAddress: string;
  ipAddress: string;
  detectionTime: string;
  description: string;
  actionsTaken: string[];
};

export const DEFAULT_SECURITY_INCIDENT: SecurityIncidentDetails = {
  incidentId: "",
  priority: "medium",
  priorityLabel: "—",
  title: "",
  macAddress: "",
  ipAddress: "",
  detectionTime: "",
  description: "",
  actionsTaken: [],
};
