import { NextFunction, Request, Response } from "express";
import { getEnvVar } from "../config/config.service";
import { ForbiddenError, UnauthorizedError } from "../utils/error-messages";
import { log } from "../utils/logger";
import { Role } from "../utils/role.enum";

/**
 * Call Auth Service API to validate the token.
 * @param req the express request object.
 * @returns the decoded token or an error.
 */
const validateToken = async (req: Request): Promise<{ sub: string; userId: string; role: Role }> => {
  // validate that the request contains the jwt access token
  if (!req.headers || !req.headers.authorization) {
    log.warn("validateToken found no token to decode!");
    throw new Error("Authorization token missing from header");
  }

  if (!getEnvVar("AUTH_USERS_SERVICE_URL")) {
    log.warn(`Unable to call Auth Users Service to validate an access token!`);
    throw new Error("Unable to call auth user service due to a missing ENV variable");
  }

  // Call Auth Service and validate the token
  try {
    log.trace(`calling auth-service with the token to attempt to validate...`);
    const response = await fetch(`${getEnvVar("AUTH_USERS_SERVICE_URL")}/validate`, {
      method: "POST",
      headers: new Headers({
        Authorization: req.headers.authorization,
      }),
    });
    if (response.status === 200) {
      log.trace("Token was validated, returning it in the body.");
      const { sub, userId, role } = (await response.json()).token;
      return { sub, userId, role };
    }
    log.warn("Token failed to validate");
    throw new Error("Authorization token is invalid");
  } catch (error) {
    log.error(`An unknown error has occurred while validating an access token! error`, error);
    throw new Error("An unknown error has occurred while validating an access token");
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
 * Verify that the token is valid and present.
 * @returns 401: Unauthorized if validation fails or token is missing. Sets the token to request body
 */
const canAccessLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
  log.trace("Attempting to validate that a user is logged in...");
  if (req.headers && req.headers.authorization) {
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
  log.trace(`The user has no token in the headers, rejecting.`);
  return res.status(401).send(new UnauthorizedError());
};

/**
 * Middleware\
 * Verify if the user has the required role or admin role in their valid jwt token.\
 * @returns 401: Unauthorized if validation fails or sets the token to request body
 */
const canAccessMinRoleUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    log.trace("Attempting to validate user as either User or Admin...");
    const token = await validateToken(req);
    if (token.role === Role.admin || token.role === Role.user) {
      req.body.token = token;
      log.trace(`User validated as ${req.body.token.role}.`);
      return next();
    } else {
      log.trace("User was NOT admin or User, rejecting.");
      return res.status(403).send(new ForbiddenError());
    }
  } catch (error) {
    log.error(`An error has occurred while validating the user`, error);
    return res.status(401).send(new UnauthorizedError());
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
    log.error("TOKEN", token);
    if (token.role === Role.admin) {
      req.body.token = token;
      log.trace("Admin successfully validated.");
      return next();
    } else {
      log.warn("User was NOT admin, rejecting.");
      return res.status(403).send(new ForbiddenError());
    }
  } catch (error) {
    log.error(`An error has occurred while validating the user`, error);
    return res.status(401).send(new UnauthorizedError());
  }
};

export { canAccessMinRoleUser, canAccessRoleAdmin, canAccessAnonymous, canAccessLoggedIn };
