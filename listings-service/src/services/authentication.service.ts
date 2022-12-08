import chalk from "chalk";
import jwt, { JwtPayload } from "jsonwebtoken";

export class AuthenticationService {
  /**
   * Extracts the JWT token out of the request.
   * @param req the express request reference.
   * @returns the decoded token object or null if it can't get it.
   */
  static getTokenFromRequest(req: any): JwtPayload | null {
    try {
      const token = req.headers.authorization.replace("Bearer ", ""); // extract the token and remove the bearer part
      return jwt.decode(token) as JwtPayload;
    } catch (error) {
      console.log(
        new Date().toISOString() +
          chalk.redBright(` [ERROR] An error has occurred while extracting the access token!`, error.stack)
      );
      return null;
    }
  }
}
