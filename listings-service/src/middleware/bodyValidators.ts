import { NextFunction, Request, Response } from "express";
import { validate as isValidUuid } from "uuid";
import { MissingPropertyError, ValidationError } from "../utils/error-messages";

/**
 * Middleware function designed to only let valid User variables pass to the Router
 *
 * If any attribute is not set, an appropriate error is returned to the caller
 * informing of them of the missing attribute
 * 
 * If all fields are present, the body will look something like this:
 ```json
 {
    "username": "string",
    "password": "string",
    "fullName": "string"
  }
```
 * An example of an error response would look like this with an HTTP status of 422:
```json
{
    "error": "MissingProperty",
    "detail": "property: 'password' is missing"
}
```
 * @param req Express Request object
 * @param res Express Response object
 * @param next Express NextFunction object
 */
const validateUpdateListingRequestBody = (req: Request, res: Response, next: NextFunction) => {
  const { name, description, imageUrl, createdBy } = req.body!;
  if (createdBy && !isValidUuid(createdBy)) {
    return res.status(400).send(new ValidationError("The provided UUID was not valid."));
  }
  req.body = { name, description, imageUrl, createdBy };
  next();
  return;
};

const validateCreateListingRequestBody = (req: Request, res: Response, next: NextFunction) => {
  const { name, description, imageUrl, createdBy } = req.body!;
  if (!name) {
    return res.status(400).send(new MissingPropertyError("name"));
  }
  if (!description) {
    return res.status(400).send(new MissingPropertyError("description"));
  }
  if (!imageUrl) {
    return res.status(400).send(new MissingPropertyError("imageUrl"));
  }
  if (!createdBy) {
    return res.status(400).send(new MissingPropertyError("createdBy"));
  } else if (!isValidUuid(createdBy)) {
    return res.status(400).send(new ValidationError("The provided UUID was not valid."));
  }
  req.body = { name, description, imageUrl, createdBy };
  next();
  return;
};

export { validateUpdateListingRequestBody, validateCreateListingRequestBody };