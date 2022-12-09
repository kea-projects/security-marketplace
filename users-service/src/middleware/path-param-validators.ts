import { NextFunction, Request, Response } from "express";
import { validate as isValidUuid } from "uuid";
import { UnauthorizedError, ValidationError } from "../utils/error-messages";
import { log } from "../utils/logger";

const paramUuidValidator = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  log.info(`Checking that the parameter id: '${id} is a valid uuid.`);
  if (!id) {
    log.warn(`The id was invalid! rejecting...`);
    return res.status(400).send(new ValidationError("UUID was not provided."));
  }

  if (!isValidUuid(id)) {
    log.warn(`The id was invalid! rejecting...`);
    return res.status(400).send(new ValidationError("The provided UUID was not valid."));
  }
  log.info(`The id was valid, proceeding.`);
  return next();
};

const isOwnIdValidator = (req: Request, res: Response, next: NextFunction) => {
  const paramId = req.params.id;
  const role = req.body.token.role;
  const userId = req.body.token.userId;

  if (role !== "admin" && paramId !== userId) {
    log.warn(`The user: '${userId}' was trying to access id: '${paramId}' !`);
    return res.status(401).send(new UnauthorizedError());
  }
  log.info(`The user: '${userId}' is allowed to query: '${paramId}'.`);
  return next();
};

export { paramUuidValidator, isOwnIdValidator, isValidUuid };
