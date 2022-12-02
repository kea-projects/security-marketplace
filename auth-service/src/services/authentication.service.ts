import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getEnvVar } from "../config/config.service";
import { Role } from "../interfaces";

const secret = getEnvVar("AUTH_SECRET", false) || "changeMe";

export class AuthenticationService {
  static createAccessToken(username: string, role: Role): string {
    // TODO - implement refresh tokens + token whitelist
    const expirationDate = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 1 day ahead
    return jwt.sign({ sub: username, role, exp: expirationDate }, secret);
  }

  /**
   * Hashes and salts the plaintext password using bcrypt.
   * @param password plaintext password to hash.
   * @returns encoded password.
   */
  static async encodePassword(password: string): Promise<string> {
    const saltOrRounds = 10;
    return await bcrypt.hash(password, saltOrRounds);
  }

  /**
   * Compares the plaintext password and a hash to verify that they match.
   * @param password plaintext password.
   * @param hash password hashed with bcrypt.
   * @returns whether the strings match.
   */
  static async compareHashes(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
