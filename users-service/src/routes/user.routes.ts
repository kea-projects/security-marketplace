import { Request, Response, Router } from "express";
import { validate as isValidUuid } from "uuid";
import { uploadSingleImage } from "../config/multer.config";
import { cleanUserObjFields } from "../middleware/body-validators.middleware";
import { paramUuidValidator } from "../middleware/path-param-validators";
import { canAccessLoggedIn, canAccessMinRoleUser, canAccessRoleAdmin } from "../middleware/validate-access.middleware";
import { User } from "../models/userModel";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../utils/error-messages";
import { FilesService } from "../utils/file-uploader";
import { log } from "../utils/logger";
import { Role } from "../utils/role.enum";

const router: Router = Router();

router.get("/users", canAccessRoleAdmin, async (_req: Request, res: Response) => {
  try {
    log.trace("Attempting to retrieve a list of Users.");
    const userList: User[] = await User.findAll();
    log.trace("Returning the list of users, may be empty.");
    return res.status(200).send(userList);
  } catch (error) {
    log.error(`Error occurred while getting all users`, error);
    return res.status(500).send(new InternalServerError(`Internal Server Error - failed to get users.`));
  }
});

router.get("/users/:id", paramUuidValidator, canAccessLoggedIn, async (req: Request, res: Response) => {
  try {
    const userId = req.body.token.userId;
    log.trace(`Attempting to retrieve a User by id: '${userId}'`);
    // Get the user by id.
    const user = await User.findByPk(userId);
    if (!user) {
      log.warn(`Failed to find a user with ${userId}`);
      return res.status(404).send(`User not found`);
    }
    return res.status(200).send(user);
  } catch (error) {
    log.error(`An error occurred while getting user`, error);
    return res.status(500).send(new InternalServerError(`Internal Server Error - failed to get the user.`));
  }
});

router.post("/users", cleanUserObjFields, canAccessRoleAdmin, async (req: Request, res: Response) => {
  const user = req.body.user;
  log.trace(`Attempting to crate a user with id: ${user.userId}`);
  if (!isValidUuid(user.userId)) {
    log.warn("the provided userId was not valid!");
    return res.status(400).send(new ValidationError(`Provided UUID: '${user.userId}' is not a valid UUIDv4.`));
  }

  // Create the user entity
  try {
    await user.validate();
    const result = await user.save();
    log.info(`New user was added to the database with id: ${result.userId}`);
    return res.status(201).send(result);
  } catch (error) {
    if (error.errors) {
      log.error(`An error occurred while validating the new user`, error);
      return res.status(400).send(new ValidationError(error.errors[0]));
    } else {
      log.error(`An error occurred while saving the new user`, error);
      return res.status(500).send(new InternalServerError(`Internal Server Error - failed to create a user.`));
    }
  }
});

router.put("/users/:id/pictures", paramUuidValidator, canAccessMinRoleUser, async (req: Request, res: Response) => {
  // Validate that the user is authorized to update the given user
  if (req.body.token.role === Role.user && req.params.id !== req.body.token.userId) {
    log.warn(
      `User: '${req.body.token.userId}' was attempting to change a picture of user: '${req.body.token.userId}'.`
    );
    res.status(400).send(new UnauthorizedError());
  }

  // Process the image upload
  const token = req.body.token;
  uploadSingleImage(req, res, async (err: any) => {
    if (err) {
      log.warn(`An invalid file was uploaded: ${err.message}`);
      if (err.message == "Invalid mime type") {
        return res.status(400).send(new BadRequestError("You can only upload files of type png, jpg, and jpeg"));
      }
      if (err.message === "Too many files") {
        return res.status(400).send(new BadRequestError("You can only upload one file"));
      }
      if (err.message === "Unexpected field") {
        return res.status(400).send(new BadRequestError("The field key has to be 'file'"));
      }
      log.error(`An unexpected error has occurred while uploading files.`);
      return res
        .status(500)
        .send(new InternalServerError("Unexpected error occurred while trying to upload the file."));
    }
    try {
      const userId = token.userId;
      const fileName = req.file!.originalname;
      const fileBuffer = req.file!.buffer;
      const pictureUrl = FilesService.getResourceUrl(userId, fileName);

      const user = await User.findByPk(userId);
      if (!user) {
        log.warn(`User with id: ${userId} not found!.`);
        return res.status(404).send(new NotFoundError(`User with id: ${userId} not found!.`));
      }

      // Upload the new image
      const uploadedPicture = FilesService.uploadFile(fileBuffer, FilesService.getFilename(userId, fileName));
      if (!uploadedPicture) throw new Error("Failed to upload the file");

      // Update the user's picture url
      try {
        user.set({ pictureUrl });
        user.save();
        return res.status(202).send(user);
      } catch (error) {
        log.error(`An error occurred while updating the user's image url`, error);
        return res
          .status(500)
          .send(new InternalServerError(`Internal Server Error - failed to update the users image.`));
      }
    } catch (error) {
      log.error(`An unknown error has occurred while uploading file`, error);
      return res.status(500).send(new InternalServerError(`Internal Server Error - failed to update the users images`));
    }
  });
});

export { router as userRouter };
