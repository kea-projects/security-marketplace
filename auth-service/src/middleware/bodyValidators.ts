import { NextFunction, Request, Response } from "express";
import { MissingPropertyError } from "../utils/error-messages";

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
const validateSignupRequestBody = (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body!;

  if (!username) {
    res.status(400).send(new MissingPropertyError("username"));
  }

  if (!password) {
    res.status(400).send(new MissingPropertyError("password"));
  }
  req.body = { username, password };
  next();
};

const validateLoginRequestBody = validateSignupRequestBody;

export { validateSignupRequestBody, validateLoginRequestBody };