import { Request, Response, NextFunction } from "express";
import { User } from "../models/userModel";
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
  const { userId, email, name, pictureUrl } = req.body!;

  if (!userId) {
    return res.status(400).send(new MissingPropertyError("userId"));
  }
  if (!email) {
    return res.status(400).send(new MissingPropertyError("email"));
  }
  if (!name) {
    return res.status(400).send(new MissingPropertyError("name"));
  }

  req.body = {};
  if (pictureUrl) {
    req.body.user = new User({ userId, email, name, pictureUrl });
  } else {
    req.body.user = new User({ userId, email, name });
  }
  return next();
};

export { cleanUserObjFields };
