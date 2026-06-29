import * as argon2 from 'argon2';

export class Argon2Util {
  static async hash(value: string): Promise<string> {
    return argon2.hash(value, {
      memoryCost: Number(process.env.ARGON2_MEMORY_COST ?? 19456),
      timeCost: Number(process.env.ARGON2_TIME_COST ?? 2),
      parallelism: 1,
      type: argon2.argon2id,
    });
  }

  static async verify(hash: string, plain: string): Promise<boolean> {
    return argon2.verify(hash, plain);
  }
}
