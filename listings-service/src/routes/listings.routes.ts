import { Request, Response, Router } from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { multerConfigLargeRequest, multerConfigSingleFile } from "../config/multer.config";
import { Role } from "../interfaces";
import { validateCreateListingRequestBody, validateUpdateListingRequestBody } from "../middleware/bodyValidators";
import { validateUuidFromParams } from "../middleware/path-param-validators";
import { canAccessAnonymous, canAccessRoleUser } from "../middleware/validate-access.middleware";
import { CommentsService } from "../services/comments.service";
import { FilesService } from "../services/files.service";
import { ListingsService } from "../services/listings.service";
import { log } from "../utils/logger";

// Multer setup for file upload handling
const multerSingleImage = multer(multerConfigSingleFile);
const multerLargeRequest = multer(multerConfigLargeRequest);
const uploadSingleImage = multerSingleImage.single("file");
const uploadLargeRequest = multerLargeRequest.single("file");

const router: Router = Router();

router.get("", canAccessAnonymous, async (req: Request, res: Response) => {
  try {
    const token = req.body?.token;

    if (!token) {
      log.trace(`No access token, Returning all public listings`);
      return res.send(await ListingsService.findByIsPublic());
    }

    if (token && token.role != Role.admin) {
      log.trace(`Access role: User, Returning all public listings and listings of user ${token.userId}`);
      return res.send(await ListingsService.findByCreatedByOrPublic(token.userId as string));
    }

    log.trace(`Access role: Admin, Returning all listings`);
    return res.send(await ListingsService.findAll());
  } catch (error) {
    log.error(`Failed to get all listings!`, error);
    return res.status(500).send({ message: "Internal Server Error - failed to get the listings." });
  }
});

router.get("/:id", canAccessAnonymous, validateUuidFromParams, async (req: Request, res: Response) => {
  try {
    // Fetch the listing entity
    const foundListing = await ListingsService.findOne(req.params.id);
    if (!foundListing) {
      log.info(`Failed to find listing with id ${req.params.id}`);
      return res.status(404).send({ message: "Listing not found" });
    }
    log.trace(`Listing found with id ${req.params.id}`);

    // Fetch the comments of the given listing
    log.trace(`Getting comments of listing ${foundListing.listingId}`);
    const comments = await CommentsService.findByListingId(foundListing.listingId as string);
    if (!comments) {
      log.warn(`Failed to get comments for listing with id: ${req.params.id}`);
      return res.status(403).send({ message: "Forbidden" });
    }

    // Check if the user is authorized to access the given listing
    log.trace(`Getting access token from request body`);
    const token = req.body?.token;

    // No token and the listing is public - return the listing
    if (!token && foundListing.isPublic) {
      log.trace(`Returning the public listing`);
      return res.send({ listing: foundListing, comments });
    }
    // The user is an administrator - return the listing
    if (token && token.role === Role.admin) {
      log.trace(`Returning the listing for the admin user`);
      return res.send({ listing: foundListing, comments });
    }
    // The user owns the listing - return the listing
    if (token && token.role != Role.admin && foundListing.createdBy === token.userId) {
      log.trace(`Returning the listing that belongs to ${token.userId}`);
      return res.send({ listing: foundListing, comments });
    }

    //The authorization failed for the other steps - return 403: Forbidden
    log.warn(`User with id ${token?.userId} tried to access a listing of another user!`);
    return res.status(403).send({ message: "Forbidden" });
  } catch (error) {
    log.error(`An error has occurred while getting a listing with id ${req.params.id}`, error);
    return res.status(500).send({ message: "Internal Server Error - failed to get the listing." });
  }
});

router.patch(
  "/:id",
  validateUuidFromParams,
  validateUpdateListingRequestBody,
  canAccessRoleUser,
  async (req: Request, res: Response) => {
    try {
      log.trace(`Updating listing ${req.params.id}`);

      const foundListing = await ListingsService.findOne(req.params.id);
      const token = req.body?.token;
      if (token?.role != Role.admin && token?.userId != foundListing?.createdBy) {
        log.warn(`User with id ${token?.userId} tried to access a listing of another user!`);
        return res.status(403).send({ message: "Forbidden" });
      }

      log.info(`Updating listing ${req.params.id}`);
      return res.send(await ListingsService.update(req.params.id, req.body));
    } catch (error) {
      log.error(`Failed to get a listing by id ${req.params.id}!`, error);
      return res.status(500).send({ message: "Internal Server Error - failed to update the listing." });
    }
  }
);

router.post("", canAccessRoleUser, async (req: Request, res: Response) => {
  const token = req.body.token;
  uploadLargeRequest(req, res, async function (err: any) {
    validateCreateListingRequestBody(req, res, () => {});
    // Check if the validation has responded to the HTTP call due to errors with request body
    if (res.writableEnded) {
      return;
    }
    try {
      // Handle file upload errors
      if (err) {
        log.warn(`An invalid file was uploaded: ${err.message}!`);
        if (err.message == "Invalid mime type") {
          return res.status(400).send({ message: "You can only upload files of type png, jpg, and jpeg" });
        }
        if (err.message === "Too many files") {
          return res.status(400).send({ message: "You can only upload one file" });
        }
        if (err.message === "Unexpected field") {
          return res.status(400).send({ message: "The field key has to be 'file'" });
        }
        return res.status(403).send({ message: "Forbidden" });
      }

      // Validate that the user is authenticated
      if (!token || !token?.userId) {
        log.warn(`Listing creation failed due to a missing token`);
        return res.status(403).send({ message: "Forbidden" });
      }

      // Create a listing
      log.trace(`Creating a listing`);
      const { name, description, isPublic } = req.body;
      const listingId = uuidv4();
      const imageUrl = FilesService.getResourceUrl(listingId, req.file?.originalname as string);
      log.trace(`Creating listing with id ${listingId}`);
      const listing = await ListingsService.create({
        listingId,
        name,
        description,
        isPublic,
        imageUrl,
        createdBy: token!.userId,
      });
      if (!listing) {
        log.error(`Failed to create a listing!`);
        throw new Error("Failed to create a listing");
      }

      // Upload the file
      log.trace(`Uploading file for listing ${listing.listingId}`);
      try {
        const uploadedFile = FilesService.uploadFile(
          req.file!.buffer,
          FilesService.getFilename(listingId, req.file!.originalname)
        );
        if (!uploadedFile) {
          throw new Error("Failed to upload the file");
        }
      } catch (error) {
        log.error(`Failed to upload a file as part of creating a listing with id ${listing.listingId}!`, error);
        await ListingsService.delete(listingId);
        log.warn(`Deleted the incomplete listing with id ${listing.listingId} due to failed file upload!`);
        throw new Error("Failed to upload a file");
      }
      // Return the created listing information
      log.trace(`Listing created with id ${listing.listingId}`);
      return res.status(201).send(listing);
    } catch (error) {
      log.error(` An error occurred while uploading a file!`, error);
      return res.status(500).send({ message: "Internal Server Error - failed to create a listing." });
    }
  });
});

router.delete("/:id", validateUuidFromParams, canAccessRoleUser, async (req: Request, res: Response) => {
  try {
    log.trace(`Deleting a listing with id ${req.params.id}`);
    // Fetch the listing
    const foundListing = await ListingsService.findOne(req.params.id);

    // Check if the user is authorized to modify the listing
    const token = req.body?.token;
    if (token?.role != Role.admin && token?.userId != foundListing?.createdBy) {
      log.warn(`User with id ${token?.userId} tried to delete a listing of another user!`);
      return res.status(403).send({ message: "Forbidden" });
    }

    // Delete the listing
    const result = await ListingsService.delete(req.params.id);
    if (result === 0) {
      log.warn(`Failed to delete a listing with id ${req.params.id}!`);
      return res.status(403).send({ message: "Forbidden" });
    }
    if (result !== 1) {
      log.warn(`Deleted more than one listing with id ${req.params.id}!`);
    }
    log.info(`Deleted listing with id ${req.params.id}!`);

    // Delete the associated file
    try {
      await FilesService.deleteFile(FilesService.extractFilenameFromUrl(foundListing!.imageUrl));
    } catch (error) {
      log.error(`Failed to delete file along with its listing: ${foundListing?.imageUrl}`, error);
    }
    return res.status(202).send({ message: "Deleted" });
  } catch (error) {
    log.error(`Failed to delete a listing by id ${req.params.id}!`, error);
    return res.status(500).send({ message: "Internal Server Error - failed to delete a listing." });
  }
});

router.put("/:id/file", validateUuidFromParams, canAccessRoleUser, async (req: Request, res: Response) => {
  const token = req.body.token;
  uploadSingleImage(req, res, async function (err) {
    try {
      // Handle file upload errors
      if (err) {
        log.error(`An invalid file was uploaded: ${err.message}`, err);
        if (err.message == "Invalid mime type") {
          return res.status(400).send({ message: "You can only upload files of type png, jpg, and jpeg" });
        }
        if (err.message === "Too many files") {
          return res.status(400).send({ message: "You can only upload one file" });
        }
        if (err.message === "Unexpected field") {
          return res.status(400).send({ message: "The field key has to be 'file'" });
        }
        return res.status(403).send({ message: "Forbidden" });
      }

      // Fetch the listing
      const listingId = req.params.id;
      const listing = await ListingsService.findOne(listingId);
      if (!listing) {
        log.warn(`Failed to find a listing with id ${listingId} in order to update its file`);
        return res.status(404).send({ message: "Listing not found" });
      }

      // Validate that the user is authorized to update the given listing
      if (!token || (token.role !== Role.admin && listing!.createdBy !== token!.userId)) {
        log.warn(`User with id of ${token?.userId} tried to update a listing file they don't have access to!`);
        return res.status(403).send({ message: "Forbidden" });
      }

      // Upload the new file
      log.trace(`Updating listing file with id ${req.params.id}`);
      const filename = FilesService.getFilename(listingId, req.file!.originalname);
      const result = await FilesService.uploadFile(req.file!.buffer, filename);

      // Update the listings pictureUrl
      await ListingsService.update(listingId, { ...listing, imageUrl: result.url });

      return res.send({ url: result.url });
    } catch (error) {
      log.error(`An error occurred while uploading a file for listing with id ${req.params.id}!`, error);
      return res.status(500).send({ message: "Internal Server Error - failed to update the listing's file." });
    }
  });
});

export { router as listingsRouter };
