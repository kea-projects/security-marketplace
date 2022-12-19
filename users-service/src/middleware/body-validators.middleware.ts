import { NextFunction, Request, Response } from "express";
import validator from "validator";
import { User } from "../models/userModel";
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
    "userId": "UUIDv4"
    "email": "string",
    "name": "string",
    "pictureUrl": "string"
  }
```
 * An example of an error response would look like this with an HTTP status of 422:
```json
{
    "error": "MissingProperty",
    "detail": "property: 'email' is missing"
}
``` 
 * @param req Express Request object
 * @param res Express Response object
 * @param next Express NextFunction object
 */
const validateUserObjFields = (req: Request, res: Response, next: NextFunction) => {
  const { userId, email, name } = req.body;
  log.trace(`Cleaning the request.body of any extra fields not related to User`);

  validateEmail(email, res);

  if (!userId) {
    log.warn(`Request body validation failed: The body was missing the: 'userId' attribute`);
    return res.status(400).send(new MissingPropertyError("userId"));
  }
  if (!name) {
    log.warn(`Request body validation failed: The body was missing the: 'name' attribute`);
    return res.status(400).send(new MissingPropertyError("name"));
  }

  log.trace(`All required attributes are present, clearing the body.`);
  req.body = {};
  log.trace(`Setting request.body to only contain User object.`);
  req.body.user = new User({ userId, email: sanitizeEmail(email, "email"), name: sanitizeText(name, "name") });
  if (res.writableEnded) {
    return;
  }
  return next();
};

function validateEmail(email: unknown, res: Response) {
  // Email exists
  if (!email) {
    log.warn(`Request body validation failed: The body was missing the: 'email' attribute`);
    return res.status(400).send(new MissingPropertyError("email"));
  }

  // Email is a string, and matches email regex
  if (typeof email !== "string" || !email.match(/^[A-Z0-9+_.-]+@[A-Z0-9.-]+$/i)) {
    log.warn(`Request body validation failed: The 'email' attribute is not a valid email.`);
    return res.status(400).send(new ValidationError(`The 'email' attribute is not a valid email.`));
  }

  // Email has proper length
  if (email.length > 254) {
    log.warn(`Request body validation failed: The 'email' attribute is too long.`);
    return res.status(400).send(new ValidationError(`The 'email' attribute is too long. Maximum 254 characters.`));
  }

  return null;
}

/**
 * Escapes special characters from the text. Logs if it had to sanitize the string.
 * @param text the text to sanitize.
 * @param fieldName the field name for logging purposes.
 * @returns the sanitized text.
 */
function sanitizeText(text: string, fieldName: string): string {
  const cleanText = validator.escape(validator.trim(text));
  if (text !== cleanText) {
    log.warn(`Sanitized ${fieldName} field from '${text}' to '${cleanText}'`);
  }
  return cleanText;
}
/**
 * Canonicalizes an email address. Logs if it had to sanitize it.
 * @param text the email to sanitize.
 * @param fieldName the field name for logging purposes.
 * @returns the sanitized email.
 */
function sanitizeEmail(email: string, fieldName: string): string {
  const cleanEmail = validator.normalizeEmail(email);
  if (email !== cleanEmail) {
    log.warn(`Sanitized ${fieldName} field from '${email}' to '${cleanEmail}'`);
  }
  if (!cleanEmail) {
    log.warn(`Failed to sanitize ${fieldName} field as an email!`);
    throw new Error(`Failed to sanitize ${fieldName} field as an email!`);
  }
  return cleanEmail;
}
export { validateUserObjFields };
