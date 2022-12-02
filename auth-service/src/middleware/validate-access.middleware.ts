import chalk from "chalk";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getEnvVar } from "../config/config.service";

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
    console.log("token", token);

    const decodedToken = jwt.verify(token, secret) as JwtPayload;
    console.log("decoded", decodedToken);

    if (!(decodedToken?.role === "admin" || decodedToken?.role === "user")) {
      return next();
    }
    return next();
  } catch (error) {
    console.log(
      new Date().toISOString() +
        chalk.redBright(` [ERROR] An error has occurred while validating an access token!`, error.stack)
    );
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
    console.log("token", token);

    const decodedToken = jwt.verify(token, secret) as JwtPayload;
    console.log("decoded", decodedToken);

    console.log("yeety1");

    if (decodedToken?.role === "admin") {
      console.log("yeety2");
      return next();
    }
  } catch (error) {
    console.log(
      new Date().toISOString() +
        chalk.redBright(` [ERROR] An error has occurred while validating an access token!`, error.stack)
    );
  }

  return res.status(401).send({ message: "Unauthorized" });
};

export { canAccessRoleUser, canAccessRoleAdmin };
