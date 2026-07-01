export const MAX_LOGIN_ATTEMPTS = 4;

export function formatLockoutCountdown(secondsRemaining: number) {
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  if (mins > 0) {
    return `${mins}m ${secs.toString().padStart(2, "0")}s`;
  }
  return `${secs}s`;
}

export function buildLockoutMessage(secondsRemaining: number) {
  return `Account locked after ${MAX_LOGIN_ATTEMPTS} invalid attempts. Try again in ${formatLockoutCountdown(secondsRemaining)}.`;
}
