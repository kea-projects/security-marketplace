import { Request, Response, Router } from "express";
import { validate as isValidUuid } from "uuid";
import { uploadSingleImage } from "../config/multer.config";
import { cleanUserObjFields } from "../middleware/bodyValidators";
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
    log.error(`Error occurred while getting user`, error);
    return res.status(500).send(new InternalServerError(`Unable to reach database.`));
  }
});

router.get("/users/:id", paramUuidValidator, canAccessLoggedIn, async (req: Request, res: Response) => {
  const userId = req.body.token.userId;
  log.trace(`Attempting to retrieve a User by id: '${userId}'`);
  try {
    const user: User | null = await User.findByPk(userId);
    if (user) {
      log.trace(`User was found, returning the user.`);
      return res.status(200).send(user);
    } else {
      log.warn(`User not was found, returning 404.`);
      return res.status(404).send(new NotFoundError(`User with id: '${userId}' was not found in the database.`));
    }
  } catch (error) {
    log.error(`Error occurred while getting user`, error);
    return res.status(500).send(new InternalServerError(`Unable to reach database.`));
  }
});

router.post("/users", cleanUserObjFields, canAccessRoleAdmin, async (req: Request, res: Response) => {
  const user = req.body.user;
  log.trace(`Attempting to crate a user with id: ${user.userId}`);
  if (!isValidUuid(user.userId)) {
    log.error("the provided userId was not valid!");
    return res.status(400).send(new ValidationError(`Provided UUID: '${user.userId}' is not a valid UUIDv4.`));
  }

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
      return res.status(500).send(new InternalServerError());
    }
  }
});

router.put("/users/:id/pictures", paramUuidValidator, canAccessMinRoleUser, async (req: Request, res: Response) => {
  if (req.body.token.role === Role.user && req.params.id !== req.body.token.userId) {
    log.warn(
      `User: '${req.body.token.userId}' was attempting to change a picture of user: '${req.body.token.userId}'.`
    );
    res.status(400).send(new UnauthorizedError());
  }
  // TODO: csrf token, this is a form!
  const token = req.body.token;
  uploadSingleImage(req, res, async (err: any) => {
    if (err) {
      log.warn(`An invalid file was uploaded: ${err.message}`);
      if (err.message == "Invalid mime type") {
        log.error(`Invalid file mime type`);
        return res.status(400).send(new BadRequestError("You can only upload files of type png, jpg, and jpeg"));
      }
      if (err.message === "Too many files") {
        log.error(`Too many files attempted to be uploaded`);
        return res.status(400).send(new BadRequestError("You can only upload one file"));
      }
      if (err.message === "Unexpected field") {
        log.error(`An unexpected field was found with the file`);
        return res.status(400).send(new BadRequestError("The field key has to be 'file'"));
      }
      log.error(`An unexpected error has occurred while uploading files.`);
      return res
        .status(500)
        .send(new InternalServerError("Unexpected error occurred while trying to upload the file."));
    }
    const userId = token.userId;
    const fileName = req.file!.originalname;
    const fileBuffer = req.file!.buffer;
    const pictureUrl = FilesService.getResourceUrl(userId, fileName);
    const user: User | null = await User.findByPk(userId);

    if (!user) {
      log.warn(`User with id: ${userId} not found!.`);
      return res.status(404).send(new NotFoundError(`User with id: ${userId} not found!.`));
    }

    try {
      const uploadedPicture = FilesService.uploadFile(fileBuffer, FilesService.getFilename(userId, fileName));
      if (!uploadedPicture) throw new Error("Failed to upload the file");
    } catch (error) {
      log.error(`An unknown error has occurred while uploading file`, error);
      return res.status(500).send(new InternalServerError("An unknown error has occurred while uploading file"));
    }

    try {
      user.set({ pictureUrl });
      user.save();
      return res.status(202).send(user);
    } catch (error) {
      log.error(`Error occurred while updating the user's image url`, error);
      return res.status(500).send(new InternalServerError(`Unable to reach database.`));
    }
  });
});

export { router as userRouter };
