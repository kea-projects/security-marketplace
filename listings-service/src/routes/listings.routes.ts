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
    if (token && token.role == Role.admin) {
      return res.send(await ListingsService.findAll());
    }
    return res.send(await ListingsService.findByIsPublic());
  } catch (error) {
    log.error(`Failed to get all listings!`, error);
    return res.status(403).send({ message: "Forbidden" });
  }
});

router.get("/user/:id", canAccessRoleUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const token = req.body?.token;
    if (token && (token.role == Role.admin || (token.userId as string) === id)) {
      return res.send(await ListingsService.findAllByCreatedBy(id));
    }
    return res.send(await ListingsService.findPublicByCreatedBy(id));
  } catch (error) {
    log.error(`Failed to get all listings!`, error);
    return res.status(403).send({ message: "Forbidden" });
  }
});

router.get("/:id", canAccessAnonymous, validateUuidFromParams, async (req: Request, res: Response) => {
  try {
    const foundListing = await ListingsService.findOne(req.params.id);
    if (!foundListing) {
      res.status(404).send({ message: "Listing not found" });
    } else {
      const token = req.body?.token;
      if (!token && foundListing.isPublic) {
        return res.send(foundListing);
      }
      if (token && token.role != Role.admin) {
        if (foundListing.createdBy === token.userId) {
          return res.send(foundListing);
        }
        log.warn(`User with id ${token?.userId} tried to access a listing of another user!`);
        return res.status(403).send({ message: "Forbidden" });
      }

      try {
        const comments = await CommentsService.findByListingId(foundListing.listingId as string);
        return res.send({ listing: foundListing, comments });
      } catch (error) {
        log.error(`Failed to get comments for listing with id: ${req.params.id}`, error);
        return res.status(403).send({ message: "Forbidden" });
      }
    }
  } catch (error) {
    log.error(`Failed to get a listing with id: ${req.params.id}`, error);
  }
  return res.status(403).send({ message: "Forbidden" });
});

router.patch(
  "/:id",
  validateUuidFromParams,
  validateUpdateListingRequestBody,
  canAccessRoleUser,
  async (req: Request, res: Response) => {
    try {
      const foundListing = await ListingsService.findOne(req.params.id);
      const token = req.body?.token;

      if (token?.role != Role.admin && token?.userId != foundListing?.createdBy) {
        log.warn(`User with id ${token?.userId} tried to access a listing of another user!`);
        return res.status(403).send({ message: "Forbidden" });
      }

      return res.send(await ListingsService.update(req.params.id, req.body));
    } catch (error) {
      log.error(`Failed to get a listing by id!`, error);
      return res.status(403).send({ message: "Forbidden" });
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
      // Create a listing and upload a file
      const { name, description, isPublic } = req.body;
      if (!token || !token?.userId) {
        return res.status(403).send({ message: "Forbidden" });
      }
      try {
        const listingId = uuidv4();
        const imageUrl = FilesService.getResourceUrl(listingId, req.file?.originalname as string);

        const listing = await ListingsService.create({
          listingId,
          name,
          description,
          isPublic,
          imageUrl,
          createdBy: token!.userId,
        });
        // Upload the file
        try {
          const uploadedFile = FilesService.uploadFile(
            req.file!.buffer,
            FilesService.getFilename(listingId, req.file!.originalname)
          );
          if (!uploadedFile) {
            throw new Error("Failed to upload the file");
          }
        } catch (error) {
          await ListingsService.delete(listingId);
          throw new Error("Failed to upload a file");
        }
        // Return the created listing information
        return res.status(201).send(listing);
      } catch (error) {
        log.error(`Failed to create a listing!`, error);
        return res.status(403).send({ message: "Forbidden" });
      }
    } catch (error) {
      log.error(` An error occurred while uploading a file!`, error);
    }
    return res.status(403).send({ message: "Forbidden" });
  });
});

router.delete("/:id", validateUuidFromParams, canAccessRoleUser, async (req: Request, res: Response) => {
  try {
    const foundListing = await ListingsService.findOne(req.params.id);
    const token = req.body?.token;

    if (token?.role != Role.admin && token?.userId != foundListing?.createdBy) {
      log.warn(`User with id ${token?.userId} tried to delete a listing of another user!`);
      return res.status(403).send({ message: "Forbidden" });
    }
    const result = await ListingsService.delete(req.params.id);
    if (result === 0) {
      log.warn(`Failed to delete a listing with id ${req.params.id}!`);
      return res.status(403).send({ message: "Forbidden" });
    }
    if (result !== 1) {
      log.warn(`Deleted more than one listing with id ${req.params.id}!`);
    }
    log.info(`Deleted listing with id ${req.params.id}!`);
    try {
      await FilesService.deleteFile(FilesService.extractFilenameFromUrl(foundListing!.imageUrl));
    } catch (error) {
      log.error(`Failed to delete file: ${foundListing?.imageUrl}`, error);
    }
    return res.status(202).send({ message: "Deleted" });
  } catch (error) {
    log.error(`Failed to delete a listing by id!`, error);
    return res.status(403).send({ message: "Forbidden" });
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
      const listingId = req.params.id;
      const listing = await ListingsService.findOne(listingId);
      if (listing && token && token.role !== Role.admin && listing!.createdBy === token!.userId) {
        const filename = FilesService.getFilename(listingId, req.file!.originalname);
        const result = await FilesService.uploadFile(req.file!.buffer, filename);
        return res.send({ url: result.url });
      } else {
        log.warn(`User with id of ${token?.userId} tried to update a listing file they don't have access to!`);
        return res.status(403).send({ message: "Forbidden" });
      }
    } catch (error) {
      log.error(`An error occurred while uploading a file!`, error);
    }
    return res.status(403).send({ message: "Forbidden" });
  });
});

export { router as listingsRouter };
