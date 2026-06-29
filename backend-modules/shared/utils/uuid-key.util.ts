import { randomBytes } from 'crypto';

export class UuidKeyUtil {
  static generateSerialKey(): string {
    const raw = randomBytes(8).toString('hex').toUpperCase();
    return raw.match(/.{1,4}/g)?.join('-') ?? '0000-0000-0000-0000';
  }
}
