import { NextFunction, Request, Response } from "express";
import { UnauthorizedError, ValidationError } from "../utils/error-messages";
import { validate as isValidUuid } from "uuid";

const paramUuidValidator = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send(new ValidationError("UUID was not provided."));
  }

  if (!isValidUuid(id)) {
    return res.status(400).send(new ValidationError("The provided UUID was not valid."));
  }

  return next();
};

const isOwnIdValidator = (req: Request, res: Response, next: NextFunction) => {
  const paramId = req.params.id;
  const role = req.body.token.role
  const userId = req.body.token.userId;

  if (role !== 'admin' && paramId !== userId) {
    return res.status(401).send(new UnauthorizedError());
  }

  return next();
};

export { paramUuidValidator , isOwnIdValidator, isValidUuid };
