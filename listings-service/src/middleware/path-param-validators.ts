import { NextFunction, Request, Response } from "express";
import { validate as isValidUuid } from "uuid";
import { ValidationError } from "../utils/error-messages";
import { log } from "../utils/logger";

const validateUuidFromParams = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  log.trace(`Checking that the parameter id: '${id} is a valid uuid.`);
  if (!id) {
    log.warn(`The id was invalid! rejecting...`);
    return res.status(400).send(new ValidationError("UUID was not provided."));
  }

  if (!isValidUuid(id)) {
    log.warn(`The id was invalid! rejecting...`);
    return res.status(400).send(new ValidationError("The provided UUID was not valid."));
  }
  log.trace(`The id was valid, proceeding.`);
  return next();
};

export { validateUuidFromParams };
