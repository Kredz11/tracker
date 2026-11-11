import { ValidationError } from "./errors";

export function validateEmail(email: string): void {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) {
    throw new ValidationError("Invalid email format");
  }
}

export function validatePassword(password: string): void {
  if (password.length < 6) {
    throw new ValidationError("Password must be at least 6 characters");
  }
}

export function validateUrl(url: string): void {
  try {
    new URL(url);
  } catch {
    throw new ValidationError("Invalid URL format");
  }
}

export function validateRequiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ValidationError(`${field} is required`);
  }
  return value.trim();
}
