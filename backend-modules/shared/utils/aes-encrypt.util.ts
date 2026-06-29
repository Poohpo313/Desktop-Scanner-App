import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export class AesEncryptUtil {
  static encrypt(plainText: string): string {
    const key = Buffer.from(process.env.AES_SECRET_KEY ?? '', 'hex');
    const iv = randomBytes(Number(process.env.AES_IV_LENGTH ?? 12));
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  static decrypt(payload: string): string {
    const key = Buffer.from(process.env.AES_SECRET_KEY ?? '', 'hex');
    const [ivHex, tagHex, dataHex] = payload.split(':');
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataHex, 'hex')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  }
}
