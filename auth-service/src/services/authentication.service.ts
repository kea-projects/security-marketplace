import * as bcrypt from "bcrypt";
import chalk from "chalk";
import jwt from "jsonwebtoken";
import { getEnvVar } from "../config/config.service";
import { Role } from "../interfaces";
import { TokenService } from "./token.service";

const secret = getEnvVar("AUTH_SECRET", false) || "changeMe";

export class AuthenticationService {
  /**
   * Extracts the JWT token out of the request.
   * @param req the express request reference.
   * @returns the token or null if it can't get it.
   */
  static getTokenFromRequest(req: any): string | null {
    try {
      return req.headers.authorization.replace("Bearer ", ""); // extract the token and remove the bearer part
    } catch (error) {
      console.log(
        new Date().toISOString() +
          chalk.redBright(` [ERROR] An error has occurred while extracting the access token!`, error.stack)
      );
      return null;
    }
  }

  /**
   * Creates a access and refresh token pair. Returns
   * @param username
   * @param role
   * @returns both tokens if successfully created, or null if it fails.
   */
  static async createAccessToken(
    username: string,
    role: Role
  ): Promise<{ accessToken: string; refreshToken: string } | null> {
    // TODO - implement refresh tokens + token whitelist
    const refreshExpirationDate = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 1 day ahead
    const accessExpirationDate = Math.floor(Date.now() / 1000) + 60 * 15; // 15 minutes ahead
    const refreshToken = jwt.sign({ sub: username, role, exp: refreshExpirationDate }, secret);
    const accessToken = jwt.sign({ sub: username, role, exp: accessExpirationDate }, secret);
    const savedToken = await TokenService.createToken({
      accessToken,
      refreshToken,
      expiresAt: new Date(refreshExpirationDate * 1000),
    });
    if (savedToken) {
      return { accessToken, refreshToken };
    }
    console.log(new Date().toISOString() + chalk.yellowBright(` [WARN] The created token is null!`));
    return null;
  }

  /**
   * Validates signature and expiration date are valid
   * @param token the token to verify
   * @returns whether it's valid or not
   */
  static isValidToken(token: string): boolean {
    try {
      jwt.verify(token, secret);
      return true;
    } catch (error) {
      return false;
    }
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
