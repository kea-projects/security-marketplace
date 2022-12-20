import { NextFunction, Request, Response } from "express";
import { validate as isValidUuid } from "uuid";
import validator from "validator";
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
  const { name, description, isPublic } = req.body;
  log.trace(`Validating the request.body of Update Listing Request`);

  validateName(name, res);
  validateDescription(description, res);

  if (isPublic === undefined) {
    log.warn(`Request body validation failed: The body was missing the: 'isPublic' attribute`);
    return res.status(400).send(new MissingPropertyError("isPublic"));
  }
  if (
    typeof isPublic === "boolean" ||
    (typeof isPublic === "string" && (isPublic.toLowerCase() === "true" || isPublic.toLowerCase() === "false"))
  ) {
    const convertedIsPublic = typeof isPublic === "boolean" ? isPublic : isPublic.toLowerCase() === "true";

    req.body = {
      name: sanitizeText(name, "name"),
      description: sanitizeText(description, "description"),
      isPublic: convertedIsPublic,
    };
    if (res.writableEnded) {
      return;
    }
    return next();
  }
  log.warn(`Request body validation failed: The body contained invalid 'isPublic' attribute: ${isPublic}`);
  return res.status(400).send(new ValidationError("The provided Boolean isPublic field was not valid."));
};

const validateCreateListingRequestBody = (req: Request, res: Response, next: NextFunction) => {
  const { name, description, isPublic, createdBy } = req.body;

  if (createdBy !== undefined && !isValidUuid(createdBy)) {
    log.warn(`Request body validation failed: The body contained invalid 'createdBy' attribute: ${createdBy}`);
    return res.status(400).send(new ValidationError("The provided UUID was not valid."));
  }

  log.trace(`Validating the request.body of Create Listing Request`);
  if (!name) {
    log.warn(`Request body validation failed: The body was missing the: 'name' attribute`);
    return res.status(400).send(new MissingPropertyError("name"));
  }
  if (!description) {
    log.warn(`Request body validation failed: The body was missing the: 'description' attribute`);
    return res.status(400).send(new MissingPropertyError("description"));
  }

  validateName(name, res);
  validateDescription(description, res);

  if (isPublic === undefined) {
    log.warn(`Request body validation failed: The body was missing the: 'isPublic' attribute`);
    return res.status(400).send(new MissingPropertyError("isPublic"));
  } else if (
    typeof isPublic === "boolean" ||
    (typeof isPublic === "string" && (isPublic.toLowerCase() === "true" || isPublic.toLowerCase() === "false"))
  ) {
    const convertedIsPublic = typeof isPublic === "boolean" ? isPublic : isPublic.toLowerCase() === "true";
    req.body = {
      name: sanitizeText(name, "name"),
      description: sanitizeText(description, "description"),
      isPublic: convertedIsPublic,
      createdBy,
    };
    if (res.writableEnded) {
      return;
    }
    return next();
  }
  log.warn(`Request body validation failed: The body contained invalid 'isPublic' attribute: ${isPublic}`);
  return res.status(400).send(new ValidationError("The provided Boolean isPublic field was not valid."));
};

const validateCreateCommentRequestBody = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, comment, commentedOn } = req.body;
  log.trace(`Validating the request.body of Update Comment Request`);
  if (!name) {
    log.warn(`Request body validation failed: The body was missing the: 'name' attribute`);
    return res.status(400).send(new MissingPropertyError("name"));
  }
  if (!comment) {
    log.warn(`Request body validation failed: The body was missing the: 'comment' attribute`);
    return res.status(400).send(new MissingPropertyError("comment"));
  }

  validateComment(comment, res);
  validateEmail(email, res);
  validateName(name, res);

  if (!commentedOn) {
    log.warn(`Request body validation failed: The body was missing the: 'commentedOn' attribute`);
    return res.status(400).send(new MissingPropertyError("commentedOn"));
  } else if (!isValidUuid(commentedOn)) {
    log.warn(`Request body validation failed: The body contained invalid 'commentedOn' attribute: ${commentedOn}`);
    return res.status(400).send(new ValidationError("The provided UUID was not valid."));
  }
  req.body = {
    name: sanitizeText(name, "name"),
    email: sanitizeEmail(email, "email"),
    comment: sanitizeText(comment, "comment"),
    commentedOn,
  };
  if (res.writableEnded) {
    return;
  }
  return next();
};

function validateName(name: unknown, res: Response) {
  if (name !== undefined && typeof name !== "string") {
    log.warn(`Request body validation failed: The attribute 'name' is not a string.`);
    return res
      .status(400)
      .send(new ValidationError("Request body validation failed: The attribute 'name' is not a string."));
  }

  if ((name as string).length > 150) {
    log.warn(`Request body validation failed: The attribute 'name' is too long. Please get a shorter name.`);
    return res
      .status(400)
      .send(
        new ValidationError(
          "Request body validation failed: The attribute 'name' is too long. Please get a shorter name."
        )
      );
  }

  return null;
}

function validateDescription(description: unknown, res: Response) {
  if (description !== undefined && typeof description !== "string") {
    log.warn(`Request body validation failed: The attribute 'description' is not a string.`);
    return res
      .status(400)
      .send(new ValidationError("Request body validation failed: The attribute 'description' is not a string."));
  }

  if ((description as string).length > 1000) {
    log.warn(`Request body validation failed: The attribute 'description' is too long.`);
    return res
      .status(400)
      .send(new ValidationError("Request body validation failed: The attribute 'description' is too long."));
  }

  return null;
}

function validateComment(comment: unknown, res: Response) {
  if (comment !== undefined && typeof comment !== "string") {
    log.warn(`Request body validation failed: The attribute 'comment' is not a string.`);
    return res
      .status(400)
      .send(new ValidationError("Request body validation failed: The attribute 'comment' is not a string."));
  }

  if ((comment as string).length > 500) {
    log.warn(`Request body validation failed: The attribute 'comment' is too long.`);
    return res
      .status(400)
      .send(new ValidationError("Request body validation failed: The attribute 'comment' is too long."));
  }

  return null;
}

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

export { validateUpdateListingRequestBody, validateCreateListingRequestBody, validateCreateCommentRequestBody };
