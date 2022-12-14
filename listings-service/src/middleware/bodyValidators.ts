import { NextFunction, Request, Response } from "express";
import { validate as isValidUuid } from "uuid";
import { MissingPropertyError, ValidationError } from "../utils/error-messages";
import { log } from "../utils/logger";

/**
 * Middleware function designed to only let valid User variables pass to the Router
 *
 * If any attribute is not set, an appropriate error is returned to the caller
 * informing of them of the missing attribute
 * 
 * If all fields are present, the body will look something like this:
 ```json
 {
    "email": "string",
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
  const { name, description, isPublic } = req.body!;
  log.trace(`Validating the request.body of Update Listing Request`);
  if (isPublic === undefined) {
    log.warn(`Request body validation failed: The body was missing the: 'isPublic' attribute`);
    return res.status(400).send(new MissingPropertyError("isPublic"));
  } else if (
    typeof isPublic === "boolean" ||
    (typeof isPublic === "string" && (isPublic.toLowerCase() === "true" || isPublic.toLowerCase() === "false"))
  ) {
    const convertedIsPublic = typeof isPublic === "boolean" ? isPublic : isPublic.toLowerCase() === "true";
    req.body = { name, description, isPublic: convertedIsPublic };
    next();
    return;
  }
  log.warn(`Request body validation failed: The body contained invalid 'isPublic' attribute: ${isPublic}`);
  return res.status(400).send(new ValidationError("The provided Boolean isPublic field was not valid."));
};

const validateCreateListingRequestBody = (req: Request, res: Response, next: NextFunction) => {
  const { name, description, isPublic } = req.body!;
  log.trace(`Validating the request.body of Create Listing Request`);
  if (!name) {
    log.warn(`Request body validation failed: The body was missing the: 'name' attribute`);
    return res.status(400).send(new MissingPropertyError("name"));
  }
  if (!description) {
    log.warn(`Request body validation failed: The body was missing the: 'description' attribute`);
    return res.status(400).send(new MissingPropertyError("description"));
  }
  if (isPublic === undefined) {
    log.warn(`Request body validation failed: The body was missing the: 'isPublic' attribute`);
    return res.status(400).send(new MissingPropertyError("isPublic"));
  } else if (
    typeof isPublic === "boolean" ||
    (typeof isPublic === "string" && (isPublic.toLowerCase() === "true" || isPublic.toLowerCase() === "false"))
  ) {
    const convertedIsPublic = typeof isPublic === "boolean" ? isPublic : isPublic.toLowerCase() === "true";
    req.body = { name, description, isPublic: convertedIsPublic };
    next();
    return;
  }
  log.warn(`Request body validation failed: The body contained invalid 'isPublic' attribute: ${isPublic}`);
  return res.status(400).send(new ValidationError("The provided Boolean isPublic field was not valid."));
};

const validateCreateCommentRequestBody = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, comment, commentedOn } = req.body!;
  log.trace(`Validating the request.body of Update Comment Request`);
  if (!name) {
    log.warn(`Request body validation failed: The body was missing the: 'name' attribute`);
    return res.status(400).send(new MissingPropertyError("name"));
  }
  if (!email) {
    log.warn(`Request body validation failed: The body was missing the: 'email' attribute`);
    return res.status(400).send(new MissingPropertyError("email"));
  }
  if (!comment) {
    log.warn(`Request body validation failed: The body was missing the: 'comment' attribute`);
    return res.status(400).send(new MissingPropertyError("comment"));
  }
  if (!commentedOn) {
    log.warn(`Request body validation failed: The body was missing the: 'commentedOn' attribute`);
    return res.status(400).send(new MissingPropertyError("commentedOn"));
  } else if (!isValidUuid(commentedOn)) {
    log.warn(`Request body validation failed: The body contained invalid 'commentedOn' attribute: ${commentedOn}`);
    return res.status(400).send(new ValidationError("The provided UUID was not valid."));
  }
  req.body = { name, email, comment, commentedOn };
  next();
  return;
};

export { validateUpdateListingRequestBody, validateCreateListingRequestBody, validateCreateCommentRequestBody };
