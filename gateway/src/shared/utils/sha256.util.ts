import { createHash } from "crypto";

export function sha256FromBuffer(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

export function sha256FromString(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
