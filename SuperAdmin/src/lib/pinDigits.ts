export const SUPERADMIN_PIN_LENGTH = 6;

export function pinToDigits(pin: string): string[] {
  const normalized = pin.replace(/\D/g, "").slice(0, SUPERADMIN_PIN_LENGTH);
  return Array.from({ length: SUPERADMIN_PIN_LENGTH }, (_, index) => normalized[index] ?? "");
}

export function digitsToPin(digits: string[]): string {
  return digits.join("").replace(/\D/g, "").slice(0, SUPERADMIN_PIN_LENGTH);
}

export function isValidSuperAdminPin(pin: string) {
  return /^\d{6}$/.test(pin);
}
