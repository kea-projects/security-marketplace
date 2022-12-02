import { Router } from "express";
import { cleanListingObjFields } from "../middleware/bodyValidators";
import { Listing } from "../models/listingModel";
import { InternalServerError, NotFoundError, ValidationError } from "../utils/error-messages";
import { Request, Response } from "express";
import { validateUuidFromParams } from "../middleware/path-param-validators";
import { validate as isValidUuid } from "uuid";

const router: Router = Router();

router.get("/listings", async (_req: Request, res: Response) => {
  try {
    const listingsList: Listing[] = await Listing.findAll();
    return res.status(200).send(listingsList);
  } catch {
    console.error("An error occurred retrieving the lost of market entries");
    return res.status(500).send(new InternalServerError());
  }
});

router.get("/listings/:id", validateUuidFromParams, async (req: Request, res: Response) => {
  const listingId = req.params.id;

  try {
    const listing: Listing | null = await Listing.findByPk(listingId);
    if (listing) {
      return res.status(200).send(listing);
    } else {
      return res.status(404).send(new NotFoundError(`Listing with id: '${listingId}' was not found in the database.`));
    }
  } catch {
    console.error("An error occurred retrieving the lost of market entries");
    return res.status(500).send(new InternalServerError());
  }
});

router.post("/listings", cleanListingObjFields, async (req: Request, res: Response) => {
  const listing = req.body.listing;
  if (!isValidUuid(listing.createdBy)) {
    return res.status(400).send(new ValidationError(`Provided UUID: '${listing.createdBy}' is not a valid UUIDv4.`));
  }
  // TODO: Check that the uuid matches the token.

  try {
    await listing.validate();
    const result = await listing.save();
    return res.status(201).send(result);
  } catch (error) {
    if (error.errors) {
      console.log(error);
      return res.status(400).send(new ValidationError(error.errors[0]));
    } else {
      console.error("An error occurred retrieving the listings : ", error);
      return res.status(500).send(new InternalServerError());
    }
  }
});

export { router as listingRouter };
