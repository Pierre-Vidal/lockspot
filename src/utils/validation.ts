export const PASSWORD_MIN_LENGTH = 8;

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** 3 à 24 caractères : lettres, chiffres, point, tiret et underscore. */
export function isValidUsername(value: string): boolean {
  return /^[A-Za-z0-9._-]{3,24}$/.test(value.trim());
}
