import { Request, Response, NextFunction } from "express";
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
 * An example of an error response would look like this:
```json
{
    "error": "MissingProperty",
    "detail": "property: 'password' is missing"
}
```
 * @param req
 * @param res
 * @param next
 */
const cleanUserObjFields = (req: Request, res: Response, next: NextFunction) => {
  const username: string = req.body?.username;
  const password: string = req.body?.password;
  const fullName: string = req.body?.fullName;

  if (username !== undefined && password !== undefined && fullName !== undefined) {
    req.body = { username: username, password: password, fullName: fullName };
    next();
  } else {
    if (username === undefined) {
      res.status(422).send(new MissingPropertyError("username"));
    } else if (password === undefined) {
      res.status(422).send(new MissingPropertyError("password"));
    } else if (fullName === undefined) {
      res.status(422).send(new MissingPropertyError("fullName"));
    }
  }
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
 * An example of an error response would look like this:
```json
{
    "error": "MissingProperty",
    "detail": "property: 'title' is missing"
}
```
 * another example of an error response:
```json
{
    "error": "ValidationError",
    "detail": "Foreign key '2' was not found"
}
```
 * @param req
 * @param res
 * @param next
 */
const cleanMarketEntryFields = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.body?.userId;
  const title = req.body?.title;
  const content = req.body?.content;

  if (title !== undefined && content !== undefined && userId !== undefined) {
    req.body = { title: title, content: content, userId: userId };
    next();
  } else {
    if (title === undefined) {
      res.status(422).send(new MissingPropertyError("title"));
    } else if (content === undefined) {
      res.status(422).send(new MissingPropertyError("content"));
    } else if (userId === undefined) {
      res.status(422).send(new MissingPropertyError("userId"));
    }
  }
};

export { cleanUserObjFields, cleanMarketEntryFields };
