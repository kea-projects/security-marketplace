import chalk from "chalk";
import { Request, Response, Router } from "express";
import multer from "multer";
import { multerConfig } from "../config/multer.config";
import { Role } from "../interfaces";
import { validateCreateListingRequestBody, validateUpdateListingRequestBody } from "../middleware/bodyValidators";
import { validateUuidFromParams } from "../middleware/path-param-validators";
import { canAccessRoleUser } from "../middleware/validate-access.middleware";
import { AuthenticationService } from "../services/authentication.service";
import { CommentsService } from "../services/comments.service";
import { FilesService } from "../services/files.service";
import { ListingsService } from "../services/listings.service";

// Multer setup for file upload handling
const upload = multer(multerConfig);
const uploadSingleImage = upload.single("file");

const router: Router = Router();

router.get("", async (req: Request, res: Response) => {
  try {
    const token = AuthenticationService.getTokenFromRequest(req);

    if (token && token.role != Role.admin) {
      return res.send(await ListingsService.findByCreatedByOrPublic(token.userId as string));
    }
    return res.send(await ListingsService.findAll());
  } catch (error) {
    console.log(new Date().toISOString() + chalk.redBright(` [ERROR] Failed to get all listings!`), error);
    return res.status(403).send({ message: "Forbidden" });
  }
});

router.get("/:id", validateUuidFromParams, async (req: Request, res: Response) => {
  try {
    const foundListing = await ListingsService.findOne(req.params.id);
    if (!foundListing) {
      res.status(404).send({ message: "Listing not found" });
    } else {
      const token = AuthenticationService.getTokenFromRequest(req);

      if (token && token.role != Role.admin) {
        if (foundListing.createdBy === token.userId) {
          return res.send(foundListing);
        }
        console.log(
          new Date().toISOString() +
            chalk.yellowBright(` [WARN] User with id ${token?.sub} tried to access a listing of another user!`)
        );
        return res.status(403).send({ message: "Forbidden" });
      }

      try {
        const comments = await CommentsService.findByListingId(foundListing.listingId as string);
        return res.send({ listing: foundListing, comments });
      } catch (error) {
        console.log(
          new Date().toISOString() +
            chalk.redBright(` [ERROR] Failed to get comments for listing with id: ${req.params.id}`),
          error
        );
        return res.status(403).send({ message: "Forbidden" });
      }
    }
  } catch (error) {
    console.log(
      new Date().toISOString() + chalk.redBright(` [ERROR] Failed to get a listing with id: ${req.params.id}`),
      error
    );
  }
  return res.status(403).send({ message: "Forbidden" });
});

router.patch(
  "/:id",
  validateUuidFromParams,
  canAccessRoleUser,
  validateUpdateListingRequestBody,
  async (req: Request, res: Response) => {
    try {
      const foundListing = await ListingsService.findOne(req.params.id);
      const token = AuthenticationService.getTokenFromRequest(req);

      if (token?.role != Role.admin && token?.sub != foundListing?.createdBy) {
        console.log(
          new Date().toISOString() +
            chalk.yellowBright(` [WARN] User with id ${token?.sub} tried to access a listing of another user!`)
        );
        return res.status(403).send({ message: "Forbidden" });
      }

      return res.send(await ListingsService.update(req.params.id, req.body));
    } catch (error) {
      console.log(new Date().toISOString() + chalk.redBright(` [ERROR] Failed to get a listing by id!`));
      return res.status(403).send({ message: "Forbidden" });
    }
  }
);

router.post("", canAccessRoleUser, validateCreateListingRequestBody, async (req: Request, res: Response) => {
  try {
    return res.send(await ListingsService.create(req.body));
  } catch (error) {
    console.log(new Date().toISOString() + chalk.redBright(` [ERROR] Failed to create a listing!`));
    return res.status(403).send({ message: "Forbidden" });
  }
});

router.delete("/:id", validateUuidFromParams, canAccessRoleUser, async (req: Request, res: Response) => {
  try {
    const foundListing = await ListingsService.findOne(req.params.id);
    const token = AuthenticationService.getTokenFromRequest(req);

    if (token?.role != Role.admin && token?.sub != foundListing?.createdBy) {
      console.log(
        new Date().toISOString() +
          chalk.yellowBright(` [WARN] User with id ${token?.sub} tried to delete a listing of another user!`)
      );
      return res.status(403).send({ message: "Forbidden" });
    }
    const result = await ListingsService.delete(req.params.id);
    if (result === 0) {
      console.log(
        new Date().toISOString() + chalk.yellowBright(` [WARN] Failed to delete a listing with id ${req.params.id}!`)
      );
      return res.status(403).send({ message: "Forbidden" });
    }
    if (result !== 1) {
      console.log(
        new Date().toISOString() + chalk.yellowBright(` [WARN] Deleted more than one listing with id ${req.params.id}!`)
      );
    }
    console.log(new Date().toISOString() + chalk.yellowBright(` [INFO] Deleted listing with id ${req.params.id}!`));
    return res.status(202).send({ message: "Deleted" });
  } catch (error) {
    console.log(new Date().toISOString() + chalk.redBright(` [ERROR] Failed to delete a listing by id!`));
    return res.status(403).send({ message: "Forbidden" });
  }
});

router.put("/file", async (req: Request, res: Response) => {
  uploadSingleImage(req, res, async function (err) {
    try {
      // Handle file upload errors
      if (err) {
        console.log(new Date().toISOString() + chalk.yellow(` [WARN] An invalid file was uploaded: ${err.message}`));
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
      console.log(req.file);

      const result = await FilesService.uploadFile(req.file?.buffer as Buffer, req.file?.originalname as string);
      return res.send({ url: result.url });
    } catch (error) {
      console.log(
        new Date().toISOString() + chalk.redBright(` [ERROR] An error occurred while uploading a file!`),
        error
      );
    }
    return res.status(403).send({ message: "Forbidden" });
  });
});

export { router as listingsRouter };
