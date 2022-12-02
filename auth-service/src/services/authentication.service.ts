import jwt from "jsonwebtoken";
import { getEnvVar } from "../config/config.service";

const secret = getEnvVar("AUTH_SECRET", false) || "changeMe";

export class AuthenticationService {
  static createAccessToken(username: string): string {
    // TODO - implement refresh tokens + token whitelist
    const expirationDate = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 1 day ahead
    return jwt.sign({ sub: username, exp: expirationDate }, secret);
  }
}
