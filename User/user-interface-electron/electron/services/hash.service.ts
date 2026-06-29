import { createHash } from "crypto";
import argon2 from "argon2";

export const hashService = {
  async hashPassword(password: string) {
    return argon2.hash(password, { type: argon2.argon2id });
  },

  async verifyPassword(hash: string, password: string) {
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  },

  sha256(buffer: Buffer) {
    return createHash("sha256").update(buffer).digest("hex");
  },
};
