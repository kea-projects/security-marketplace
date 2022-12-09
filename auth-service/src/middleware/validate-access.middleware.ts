import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getEnvVar } from "../config/config.service";
import { Role } from "../interfaces";
import { log } from "../utils/logger";

const secret = getEnvVar("AUTH_SECRET", false) || "changeMe";
/**
 * Middleware\
 * Verify if the user has the required role or admin role in their valid jwt token.\
 * It will return 401: Unauthorized if validation fails
 */
const canAccessRoleUser = (req: Request, res: Response, next: NextFunction) => {
  // validate that the request contains the jwt access token

  if (!req.headers || !req.headers.authorization) {
    return res.status(401).send({ message: "Unauthorized" });
  }

  // Validate the token and the associated role
  try {
    const token = req.headers.authorization.replace("Bearer ", ""); // extract the token and remove the bearer part
    const decodedToken = jwt.verify(token, secret) as JwtPayload;
    if (decodedToken?.role === Role.admin || decodedToken?.role === Role.user) {
      return next();
    }
  } catch (error) {
    log.error(`An error has occurred while validating an access token!`, error);
  }

  return res.status(401).send({ message: "Unauthorized" });
};

/**
 * Middleware\
 * Verify if the user has the required role or admin role in their valid jwt token.\
 * It will return 401: Unauthorized if validation fails
 */
const canAccessRoleAdmin = (req: Request, res: Response, next: NextFunction) => {
  // validate that the request contains the jwt access token
  if (!req.headers || !req.headers.authorization) {
    return res.status(401).send({ message: "Unauthorized" });
  }

  // Validate the token and the associated role
  try {
    const token = req.headers.authorization.replace("Bearer ", ""); // extract the token and remove the bearer part
    const decodedToken = jwt.verify(token, secret) as JwtPayload;
    if (decodedToken?.role === Role.admin) {
      return next();
    } else {
      return res.status(401).send({ message: "Unauthorized" });
    }
  } catch (error) {
    log.error(`An error has occurred while validating an access token!`, error);
  }

  return res.status(401).send({ message: "Unauthorized" });
};

export { canAccessRoleUser, canAccessRoleAdmin };
