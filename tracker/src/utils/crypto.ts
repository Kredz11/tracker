import bcrypt from "bcrypt";
import { APP_CONFIG } from "../config/app";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, APP_CONFIG.BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
