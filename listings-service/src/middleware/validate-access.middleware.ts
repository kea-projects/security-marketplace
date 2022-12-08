import chalk from "chalk";
import { NextFunction, Request, Response } from "express";
import { getEnvVar } from "../config/config.service";
import { Role } from "../interfaces";

/**
 * Middleware\
 * Verify if the user has the required role or admin role in their valid jwt token.\
 * It will return 401: Unauthorized if validation fails
 */
const canAccessRoleUser = async (req: Request, res: Response, next: NextFunction) => {
  // validate that the request contains the jwt access token
  if (!req.headers || !req.headers.authorization) {
    return res.status(401).send({ message: "Unauthorized" });
  }

  // Call Auth Service and validate the token
  try {
    const response = await fetch(`${getEnvVar("AUTH_USERS_SERVICE_URL", false)}/validate`, {
      method: "POST",
      headers: new Headers({
        Authorization: req.headers.authorization,
      }),
    });
    if (response.status === 200) {
      const body = await response.json();
      if (body.token.role === Role.admin || body.token.role === Role.user) {
        req.body.token = body.token;
        return next();
      }
    }
    console.log(new Date().toISOString() + chalk.yellow(` [WARN] Validation of an access token failed`));
    return res.status(401).send({ message: "Unauthorized" });
  } catch (error) {
    console.log(
      new Date().toISOString() +
        chalk.redBright(` [ERROR] An error has occurred while validating an access token!`, error.stack)
    );
    return res.status(401).send({ message: "Unauthorized" });
  }
};

/**
 * Middleware\
 * Verify if the user has the required role or admin role in their valid jwt token.\
 * It will return 401: Unauthorized if validation fails
 */
const canAccessRoleAdmin = async (req: Request, res: Response, next: NextFunction) => {
  // validate that the request contains the jwt access token
  if (!req.headers || !req.headers.authorization) {
    return res.status(401).send({ message: "Unauthorized" });
  }

  // Call Auth Service and validate the token
  try {
    const response = await fetch(`${getEnvVar("AUTH_USERS_SERVICE_URL", false)}/validate`, {
      method: "POST",
      headers: new Headers({
        Authorization: req.headers.authorization,
      }),
    });
    if (response.status === 200) {
      const body = await response.json();
      if (body.token.role === Role.admin) {
        req.body.token = body.token;
        return next();
      }
    }
    return res.status(401).send({ message: "Unauthorized" });
  } catch (error) {
    console.log(
      new Date().toISOString() +
        chalk.redBright(` [ERROR] An error has occurred while validating an access token!`, error.stack)
    );
    return res.status(401).send({ message: "Unauthorized" });
  }
};

export { canAccessRoleUser, canAccessRoleAdmin };
