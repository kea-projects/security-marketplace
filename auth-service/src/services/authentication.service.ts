import * as bcrypt from "bcrypt";
import { Request } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getEnvVar } from "../config/config.service";
import { Role } from "../interfaces";
import { log } from "../utils/logger";
import { TokenService } from "./token.service";

const secret = getEnvVar("AUTH_SECRET") || "changeMe";
const pepper = getEnvVar("AUTH_PEPPER") || "AlsoChangeMe";

export class AuthenticationService {
  /**
   * Extracts the JWT token out of the request.
   * @param req the express request reference.
   * @returns the token string or null if it can't get it.
   */
  static getTokenFromRequest(req: Request): string | null {
    try {
      if (!req.headers || !req.headers.authorization) {
        log.warn(`The provided request has no authorization header!`);
        return null;
      }
      return req.headers.authorization.replace("Bearer ", ""); // extract the token and remove the bearer part
    } catch (error) {
      log.error(`An error has occurred while extracting the access token!`, error);
      return null;
    }
  }

  /**
   * Extracts the JWT token out of the request.
   * @param req the express request reference.
   * @returns the decoded token object or null if it can't get it.
   */
  static decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch (error) {
      log.error(`An error has occurred while extracting the access token!`, error);
      return null;
    }
  }

  /**
   * Creates a access and refresh token pair. Returns
   * @param email
   * @param role
   * @returns both tokens if successfully created, or null if it fails.
   */
  static async createAccessToken(
    email: string,
    userId: string,
    role: Role
  ): Promise<{ accessToken: string; refreshToken: string } | null> {
    const refreshExpirationDate = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 1 day ahead
    const accessExpirationDate = Math.floor(Date.now() / 1000) + 60 * 15; // 15 minutes ahead
    const refreshToken = jwt.sign({ sub: email, userId, role, exp: refreshExpirationDate }, secret);
    const accessToken = jwt.sign({ sub: email, userId, role, exp: accessExpirationDate }, secret);
    const savedToken = await TokenService.createToken({
      accessToken,
      refreshToken,
      expiresAt: new Date(refreshExpirationDate * 1000),
    });
    if (!savedToken) {
      log.warn(`The created token is null!`);
      return null;
    }
    return { accessToken, refreshToken };
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
      log.error(`An error occurred while verifying a token`, error);
      return false;
    }
  }

  /**
   * Hashes and salts the plaintext password using bcrypt.
   * @param password plaintext password to hash.
   * @returns encoded password.
   */
  static async encodePassword(password: string): Promise<string> {
    const rounds = 10;
    return await bcrypt.hash(password + pepper, rounds);
  }

  /**
   * Compares the plaintext password and a hash to verify that they match.
   * @param password plaintext password.
   * @param hash password hashed with bcrypt.
   * @returns whether the strings match.
   */
  static async compareHashes(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password + pepper, hash);
  }
}
