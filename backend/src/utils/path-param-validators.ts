import { Request, Response } from "express";
import { ValidationError } from "./error-messages";
import { validate as uuidValidate } from "uuid";

const validateUuidFromParams = (paramName: string, req: Request, res: Response) => {
  const uuid_to_check: string = req.params[`${paramName}`];

  if (uuid_to_check === undefined) {
    return res.status(400).send(new ValidationError("UUID was not provided."));
  }
  
  
  const is_valid: boolean = uuidValidate(uuid_to_check);

  if (is_valid) {
    return is_valid;
  } else {
    return res.status(400).send(new ValidationError("The provided UUID was not valid."));
  }
};

export { validateUuidFromParams };
