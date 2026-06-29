export function canAccessRoute(_role: string | null, _path: string): boolean {
  return true;
}

export function allowedNavPaths(_role: string | null): string[] {
  return [
    "/dashboard",
    "/scan",
    "/search",
    "/files",
    "/devices",
    "/settings",
    "/settings/save-preferences",
    "/help",
    "/cloud",
    "/help-assistant",
    "/reports",
    "/print",
    "/print/confirm",
    "/print/completed",
  ];
}

export function roleLabel(role: string | null): string {
  switch (role) {
    case "admin":
      return "Administrator";
    case "operator":
      return "Scanner Operator";
    case "staff":
      return "Staff User";
    case "viewer":
      return "Viewer";
    default:
      return role ?? "User";
  }
}
