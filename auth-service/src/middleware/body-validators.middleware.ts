import { NextFunction, Request, Response } from "express";
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
const validateSignupRequestBody = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;
  log.trace(`Validating the request.body of Signup Request`);

  validateName(name, res);
  validateEmail(email, res);
  validatePassword(password, res);

  req.body = { name, email, password };
  return next();
};

const validateLoginRequestBody = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  log.trace(`Validating the request.body of Login Request`);

  validateEmail(email, res);
  validatePassword(password, res);

  req.body = { email, password };
  return next();
};

function validateName(name: unknown, res: Response) {
  // Name exists
  if (!name) {
    log.warn(`Request body validation failed: The body was missing the: 'name' attribute`);
    return res.status(400).send(new MissingPropertyError("name"));
  }

  // Name is a string
  if (typeof name !== "string") {
    log.warn(`Request body validation failed: The 'name' attribute is not a string.`);
    return res.status(400).send(new ValidationError(`The 'name' attribute is not a string.`));
  }

  // Name has proper length
  if (name.length > 120) {
    log.warn(`Request body validation failed: The 'name' attribute is too long.`);
    return res.status(400).send(new ValidationError(`The 'name' attribute is too long. Maximum 120 characters.`));
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

function validatePassword(password: unknown, res: Response) {
  // Password
  if (!password) {
    log.warn(`Request body validation failed: The body was missing the: 'password' attribute.`);
    return res.status(400).send(new MissingPropertyError("password"));
  }

  // Password is a string and matches password regex
  if (
    typeof password !== "string" ||
    !password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
  ) {
    log.warn(`Request body validation failed: The 'password' attribute is not a valid password.`);
    return res.status(400).send(new ValidationError(`The 'password' attribute is not a valid password.`));
  }

  // Password has proper length
  if (password.length < 8 || password.length > 60) {
    log.warn(`Request body validation failed: The 'password' attribute does not have the proper length.`);
    return res
      .status(400)
      .send(
        new MissingPropertyError(
          `The 'password' attribute does not have the proper length. Password length must be between 8 and 60 characters.`
        )
      );
  }

  return null;
}

export { validateSignupRequestBody, validateLoginRequestBody };
