export type ExportFolderId = "activity-logs" | "reports" | "serial-keys";

export const EXPORT_PATHS: Record<
  ExportFolderId,
  { folderName: string; filenamePrefix: string }
> = {
  "activity-logs": {
    folderName: "ActivityLogs",
    filenamePrefix: "Logs",
  },
  reports: {
    folderName: "Reports",
    filenamePrefix: "Reports",
  },
  "serial-keys": {
    folderName: "SerialKeys",
    filenamePrefix: "Keys",
  },
};

/** Full Windows path shown in the export success modal. */
export function getExportPathLabel(exportFolder: ExportFolderId): string {
  const { folderName } = EXPORT_PATHS[exportFolder];
  return `C:\\Documents\\Exports\\${folderName}`;
}
