import chalk from "chalk";
import { NextFunction, Request, Response } from "express";
import { getEnv } from "../config/secrets";
import { Role } from "../utils/role.enum";

const validateToken = async (req: Request): Promise<{ sub: string; userId: string; role: Role }> => {
  // validate that the request contains the jwt access token
  if (!req.headers || !req.headers.authorization) {
    throw new Error("Authorization token missing from header");
  }

  if (!getEnv("AUTH_USERS_SERVICE_URL")) {
    console.log(
      new Date().toISOString() +
        chalk.yellowBright(` [WARN] Unable to call Auth Users Service to validate an access token`)
    );
    throw new Error("Unable to call auth user service due to a missing ENV variable");
  }

  // Call Auth Service and validate the token
  try {
    const response = await fetch(`${getEnv("AUTH_USERS_SERVICE_URL")}/validate`, {
      method: "POST",
      headers: new Headers({
        Authorization: req.headers.authorization,
      }),
    });
    if (response.status === 200) {
      const body = await response.json();
      return { ...body.token };
    }
    throw new Error("Authorization token is invalid");
  } catch (error) {
    new Date().toISOString() +
      chalk.redBright(` [ERROR] An unknown error has occurred while validating an access token!`, error.stack);
    throw new Error("An unknown error has occurred while validating an access token");
  }
};

/**
 * Middleware\
 * Verify that the token is valid if it is present.
 * @returns 401: Unauthorized if validation fails or sets the token to request body
 */
const canAccessAnonymous = async (req: Request, res: Response, next: NextFunction) => {
  if (req.headers && req.headers.authorization) {
    try {
      const token = await validateToken(req);
      req.body.token = token;
    } catch (error) {
      return res.status(401).send({ message: "Unauthorized" });
    }
  }
  return next();
};

/**
 * Middleware\
 * Verify if the user has the required role or admin role in their valid jwt token.\
 * @returns 401: Unauthorized if validation fails or sets the token to request body
 */
const canAccessRoleUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = await validateToken(req);
    if (token.role === Role.admin || token.role === Role.user) {
      req.body.token = token;
      return next();
    }
  } catch (error) {
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
    const token = await validateToken(req);
    if (token.role === Role.admin) {
      req.body.token = token;
      return next();
    }
  } catch (error) {
    return res.status(401).send({ message: "Unauthorized" });
  }
};

export { canAccessRoleUser, canAccessRoleAdmin, canAccessAnonymous };
