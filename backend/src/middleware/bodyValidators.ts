import { Request, Response, NextFunction } from "express";
import { MarketEntry } from "../models/marketEntryModel";
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
const cleanUserObjFields = (req: Request, res: Response, next: NextFunction) => {
  const { username, password, fullName } = req.body!;

  if (!username) {
    res.status(400).send(new MissingPropertyError("username"));
  }

  if (!password) {
    res.status(400).send(new MissingPropertyError("password"));
  }
  if (!fullName) {
    res.status(400).send(new MissingPropertyError("fullName"));
  }
  req.body = {}
  req.body.user = new User({ username, password, fullName });
  return next();
};

/**
 * Middleware function designed to only let valid MarketEntry variables pass to the Router
 *
 * If any attribute is not set, an appropriate error is returned to the caller
 * informing of them of the missing attribute
 * 
 * If all fields are present, the body will look something like this:
 ```json
 {
    "userId": 1,
    "title": "string",
    "content": "string"
  }
```
 * An example of an error response would look like this with an HTTP status of 422:
```json
{
    "error": "MissingProperty",
    "detail": "property: 'title' is missing"
}
```
 * @param req Express Request object
 * @param res Express Response object
 * @param next Express NextFunction object
 */
const cleanMarketEntryFields = (req: Request, res: Response, next: NextFunction) => {
  const { title, content, userId} = req.body;

  if (!title) {
    res.status(400).send(new MissingPropertyError("username"));
  }

  if (!content) {
    res.status(400).send(new MissingPropertyError("password"));
  }
  if (!userId) {
    res.status(400).send(new MissingPropertyError("fullName"));
  }
  req.body = {}
  req.body.listing = new MarketEntry({title, content, userId})
  next();
};

export { cleanUserObjFields, cleanMarketEntryFields };
