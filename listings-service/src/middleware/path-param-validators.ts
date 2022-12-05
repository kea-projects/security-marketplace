import { NextFunction, Request, Response } from "express";
import { ValidationError } from "../utils/error-messages";
import { validate as isValidUuid } from "uuid";

const validateUuidFromParams = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  
  if (!id) {
    return res.status(400).send(new ValidationError("UUID was not provided."));
  }

  if (!isValidUuid(id)) {
    return res.status(400).send(new ValidationError("The provided UUID was not valid."));
  }
  
  return next();
};

export { validateUuidFromParams };
