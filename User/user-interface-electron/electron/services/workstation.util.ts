import { createHash } from "crypto";
import os from "os";

export function getWorkstationIdentity() {
  const hostname = os.hostname().trim() || "User-Workstation";
  const raw = `${hostname}|${os.userInfo().username}|${os.platform()}|${os.arch()}`;
  const serialNumber = `ws-${createHash("sha256").update(raw).digest("hex").slice(0, 20)}`;
  return { deviceName: hostname, serialNumber };
}
