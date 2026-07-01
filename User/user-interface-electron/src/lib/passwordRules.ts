export type PasswordRequirementCheck = {
  hasMinLength: boolean;
  hasNumber: boolean;
  hasSpecialCharacter: boolean;
};

export const PASSWORD_REQUIREMENT_SUMMARY =
  "New password must contain at least 8 characters, 1 number, and 1 special character.";

export function getPasswordRequirementCheck(password: string): PasswordRequirementCheck {
  return {
    hasMinLength: password.length >= 8,
    hasNumber: /\d/.test(password),
    hasSpecialCharacter: /[^A-Za-z0-9]/.test(password),
  };
}

export function isNewPasswordValid(password: string): boolean {
  const check = getPasswordRequirementCheck(password);
  return check.hasMinLength && check.hasNumber && check.hasSpecialCharacter;
}
