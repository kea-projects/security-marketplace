import { Request, Response, Router } from "express";
import { validate as isValidUuid } from "uuid";
import { uploadSingleImage } from "../config/multer.config";
import { cleanUserImageUrlObj, cleanUserObjFields } from "../middleware/bodyValidators";
import { isOwnIdValidator, paramUuidValidator } from "../middleware/path-param-validators";
import { User } from "../models/userModel";
import { BadRequestError, InternalServerError, NotFoundError, ValidationError } from "../utils/error-messages";
import { FilesService } from "../utils/file-uploader";
import { log } from "../utils/logger";

const router: Router = Router();

// TODO: token validation, admin only
router.get("/users", async (_req: Request, res: Response) => {
  try {
    const userList: User[] = await User.findAll();
    return res.status(200).send(userList);
  } catch (error) {
    log.info(`Error occurred while getting user:  ${error}`);
    return res.status(500).send(new InternalServerError(`Unable to reach database.`));
  }
});

// Logged in
router.get("/users/:id", paramUuidValidator, async (req: Request, res: Response) => {
  const userId = req.params.id;

  try {
    const user: User | null = await User.findByPk(userId);
    if (user) {
      return res.status(200).send(user);
    } else {
      return res.status(404).send(new NotFoundError(`User with id: '${userId}' was not found in the database.`));
    }
  } catch (error) {
    log.error("Error occurred while getting user: ${error}");
    return res.status(500).send(new InternalServerError(`Unable to reach database.`));
  }
});

// TODO: token validation, admin only
router.post("/users", cleanUserObjFields, async (req: Request, res: Response) => {
  const user = req.body.user;
  if (!isValidUuid(user.userId)) {
    return res.status(400).send(new ValidationError(`Provided UUID: '${user.userId}' is not a valid UUIDv4.`));
  }

  try {
    await user.validate();
    const result = await user.save();
    return res.status(201).send(result);
  } catch (error) {
    if (error.errors) {
      log.error(error);
      return res.status(400).send(new ValidationError(error.errors[0]));
    } else {
      log.error(`An error occurred retrieving the lost of market entries: ${error}`);
      return res.status(500).send(new InternalServerError());
    }
  }
});

// TODO: Make it not ignore multer and actually handle uploaded file
// TODO: admin can change any :id pictures
// TODO: users can only update their own pictures
router.put(
  "/users/:id/pictures",
  paramUuidValidator,
  cleanUserImageUrlObj,
  /*validateToken, */ isOwnIdValidator,
  async (req: Request, res: Response) => {
    // TODO: csrf token, this is a form!
    console.log("body", req.body);
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
        log.error(`An unknown error has occurred while uploading file, error: ${error}`);
        return res.status(500).send(new InternalServerError("An unknown error has occurred while uploading file"));
      }

      try {
        user.set({ pictureUrl });
        user.save();
        return res.status(202).send(user);
      } catch (error) {
        log.error(`Error occurred while updating the user's image url: ${error}`);
        return res.status(500).send(new InternalServerError(`Unable to reach database.`));
      }
    });
  }
);

export { router as userRouter };
