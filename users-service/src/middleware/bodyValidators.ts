import { NextFunction, Request, Response } from "express";
import { User } from "../models/userModel";
import { MissingPropertyError } from "../utils/error-messages";
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
const cleanUserObjFields = (req: Request, res: Response, next: NextFunction) => {
  const { userId, email, name } = req.body!;
  log.info(`Cleaning the request.body of any extra fields not related to User`);

  if (!userId) {
    log.error(`The body was missing the: 'userId' attribute`)
    return res.status(400).send(new MissingPropertyError("userId"));
  }
  if (!email) {
    log.error(`The body was missing the: 'email' attribute`)
    return res.status(400).send(new MissingPropertyError("email"));
  }
  if (!name) {
    log.error(`The body was missing the: 'name' attribute`)
    return res.status(400).send(new MissingPropertyError("name"));
  }
  log.info(`All required attributes are present, clearing the body.`)
  req.body = {};
  log.info(`Setting request.body to only contain User object.`)
  req.body.user = new User({ userId, email, name });
  return next();
};



export { cleanUserObjFields };
