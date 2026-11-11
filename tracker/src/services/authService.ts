import jwt from "jsonwebtoken";
import { APP_CONFIG } from "../config/app";
import { userRepository } from "../repositories/userRepository";
import { hashPassword, verifyPassword } from "../utils/crypto";
import { validateEmail, validatePassword, validateRequiredString } from "../utils/validators";
import { ConflictError, UnauthorizedError, ValidationError } from "../utils/errors";
import { logger } from "../utils/logger";

export class AuthService {
  async register(input: { email: string; password: string; displayName?: string }) {
    const email = validateRequiredString(input.email, "Email").toLowerCase();
    const password = validateRequiredString(input.password, "Password");
    validateEmail(email);
    validatePassword(password);

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError("User already exists");
    }

    const passwordHash = await hashPassword(password);
    const userId = await userRepository.create({
      email,
      passwordHash,
      displayName: input.displayName,
    });

    logger.info("User registered", { userId, email });
    return { userId, token: this.generateToken(userId, email) };
  }

  async login(input: { email: string; password: string }) {
    const email = validateRequiredString(input.email, "Email").toLowerCase();
    const password = validateRequiredString(input.password, "Password");

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const valid = await verifyPassword(password, (user as any).password_hash);
    if (!valid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    return { userId: user.id, token: this.generateToken(user.id, user.email) };
  }

  private generateToken(userId: number, email: string): string {
    return jwt.sign({ userId, email }, APP_CONFIG.JWT_SECRET, {
      expiresIn: APP_CONFIG.JWT_EXPIRES_IN,
    });
  }
}

export const authService = new AuthService();
