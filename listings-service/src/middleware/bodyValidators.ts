import { Request, Response, NextFunction } from "express";
import { Listing } from "../models/listingModel";
import { MissingPropertyError } from "../utils/error-messages";

/**
 * Middleware function designed to only let valid MarketEntry variables pass to the Router
 *
 * If any attribute is not set, an appropriate error is returned to the caller
 * informing of them of the missing attribute
 * 
 * If all fields are present, the body will look something like this:
 ```json
 {
    "name": "string",
    "description": "string",
    "imageUrl": "string",
    "createdBy": "UUIDv4"
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
const cleanListingObjFields = (req: Request, res: Response, next: NextFunction) => {
  const { name, description, imageUrl, createdBy } = req.body;

  if (!name) {
    res.status(400).send(new MissingPropertyError("name"));
  }
  if (!description) {
    res.status(400).send(new MissingPropertyError("description"));
  }
  if (!imageUrl) {
    res.status(400).send(new MissingPropertyError("imageUrl"));
  }
  if (!createdBy) {
    res.status(400).send(new MissingPropertyError("createdBy"));
  }

  req.body = {};
  req.body.listing = new Listing({ name, description, imageUrl, createdBy });
  next();
};

export { cleanListingObjFields };
