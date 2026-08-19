import { randomBytes } from "node:crypto";

const ALPHANUMERIC_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function generateRandomId(length = 5): string {
  const bytes = randomBytes(length);
  let result = "";

  for (let i = 0; i < length; i++) {
    result += ALPHANUMERIC_CHARS[bytes[i] % ALPHANUMERIC_CHARS.length];
  }

  return result;
}