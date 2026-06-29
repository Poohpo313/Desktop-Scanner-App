import type { LucideIcon } from "lucide-react";
import {
  FileStack,
  FolderOpen,
  Lock,
  Shield,
  Zap,
} from "lucide-react";

export type DiagnosticTestId =
  | "connection"
  | "driver"
  | "response"
  | "paper"
  | "permission"
  | "storage";

export type DiagnosticTestDefinition = {
  id: DiagnosticTestId;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const DIAGNOSTIC_TESTS: DiagnosticTestDefinition[] = [
  {
    id: "connection",
    title: "Device Connection",
    description: "Check if the scanner is properly connected.",
    icon: Zap,
  },
  {
    id: "driver",
    title: "Driver Status",
    description: "Verify that the correct driver is installed.",
    icon: Shield,
  },
  {
    id: "response",
    title: "Scanner Response",
    description: "Test scanner responsiveness and communication.",
    icon: Zap,
  },
  {
    id: "paper",
    title: "Paper Source",
    description: "Check if the paper source is available.",
    icon: FileStack,
  },
  {
    id: "permission",
    title: "Scan Permission",
    description: "Verify application scanning permissions.",
    icon: Lock,
  },
  {
    id: "storage",
    title: "Storage Access",
    description: "Ensure access to storage for saving scans.",
    icon: FolderOpen,
  },
];
