import { NextFunction, Request, Response } from "express";
import { Role } from "../interfaces";
import { AuthenticationService } from "../services/authentication.service";
import { TokenService } from "../services/token.service";
import { log } from "../utils/logger";

const validateToken = async (req: Request): Promise<{ sub: string; userId: string; role: Role }> => {
  // validate that the request contains the jwt access token
  if (!req.headers || !req.headers.authorization) {
    throw new Error("Authorization token missing from header");
  }

  // Check if token is valid. If not, see if it exists in the DB and wipe all tokens of the given user
  const token = req.headers.authorization.replace(`Bearer `, "");
  const isValid = AuthenticationService.isValidToken(token);
  if (!isValid) {
    log.warn(`Failed validation for an invalid token!`);
  }

  // Check if token exists in the database
  const foundTokens = await TokenService.findByToken(token);
  if (!foundTokens) {
    log.warn(`Validated token that doesn't exist in the database! ${token}`);
  }

  const decodedToken = AuthenticationService.decodeToken(token);

  // Remove all tokens of given user if previous validation has failed
  if (!isValid || !foundTokens) {
    await TokenService.deleteAllOfUser(decodedToken?.sub as string);
    log.warn(`Token wasn't valid, removed all tokens of a user: ${decodedToken?.sub as string}`);
    throw new Error("Authorization token is invalid");
  }

  if (decodedToken && decodedToken.sub && decodedToken.userId && decodedToken.role) {
    log.trace("Token was validated, returning it.");
    return { sub: decodedToken.sub, userId: decodedToken.userId, role: decodedToken.role };
  } else {
    log.warn(`The valid token was missing on of its properties: ${token}`);
    throw new Error("The valid token was missing on of its properties");
  }
};

/**
 * Middleware\
 * Verify that the token is valid if it is present.
 * @returns 401: Unauthorized if validation fails or sets the token to request body
 */
const canAccessAnonymous = async (req: Request, res: Response, next: NextFunction) => {
  log.trace("Attempting to retrieve any access token that may exist...");
  if (req.headers && req.headers.authorization) {
    log.trace("Token was found, validating...");
    try {
      const token = await validateToken(req);
      req.body.token = token;
      log.trace(`User validated as ${req.body.token.role}.`);
      return next();
    } catch (error) {
      log.error(`An error has occurred while validating the user`, error);
      return res.status(401).send({ message: "Unauthorized" });
    }
  }
  log.trace(`The user has no token in the headers, but letting him pass.`);
  return next();
};

/**
 * Middleware\
 * Verify if the user has the required role or admin role in their valid jwt token.\
 * @returns 401: Unauthorized if validation fails or sets the token to request body
 */
const canAccessRoleUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    log.trace("Attempting to validate user as either User or Admin...");
    const token = await validateToken(req);
    if (token.role === Role.admin || token.role === Role.user) {
      req.body.token = token;
      log.trace(`User validated as ${req.body.token.role}.`);
      return next();
    } else {
      log.warn("Role validation failed: User was NOT admin or user, rejecting.");
      return res.status(401).send({ message: "Unauthorized" });
    }
  } catch (error) {
    log.error("An error has occurred while validating the user", error);
    return res.status(401).send({ message: "Unauthorized" });
  }
};

/**
 * Middleware\
 * Verify if the user has the required role or admin role in their valid jwt token.\
 * @returns 401: Unauthorized if validation fails or sets the token to request body
 */
const canAccessRoleAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    log.trace("Attempting to validate user as admin...");
    const token = await validateToken(req);
    if (token.role === Role.admin) {
      req.body.token = token;
      log.trace("Admin successfully validated.");
      return next();
    } else {
      log.warn("Role validation failed: User was NOT admin, rejecting.");
      return res.status(401).send({ message: "Unauthorized" });
    }
  } catch (error) {
    log.error(`An error has occurred while validating the user`, error);
    return res.status(401).send({ message: "Unauthorized" });
  }
};

export { canAccessRoleUser, canAccessRoleAdmin, canAccessAnonymous };
