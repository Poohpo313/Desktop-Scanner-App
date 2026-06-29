import { createHash } from 'crypto';

export class Sha256Util {
  static fromBuffer(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }

  static fromString(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}
