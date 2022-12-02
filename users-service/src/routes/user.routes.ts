import { Router } from "express";
import { Request, Response } from "express";
import { cleanUserImageUrlObj, cleanUserObjFields } from "../middleware/bodyValidators";
import { User } from "../models/userModel";
import { InternalServerError, ValidationError, NotFoundError } from "../utils/error-messages";
import { validateUuidFromParams } from "../middleware/path-param-validators";
import { validate as isValidUuid } from "uuid";

const router: Router = Router();

router.get("/users", async (_req: Request, res: Response) => {
  try {
    const userList: User[] = await User.findAll();
    return res.status(200).send(userList);
  } catch (error) {
    console.log("Error occurred while getting user: ", error);
    return res.status(500).send(new InternalServerError(`Unable to reach database.`));
  }
});

router.get("/users/:id", validateUuidFromParams, async (req: Request, res: Response) => {
  const userId = req.params.id;

  // TODO: check that the id is the same as the userId in the token

  try {
    const user: User | null = await User.findByPk(userId);
    if (user) {
      return res.status(200).send(user);
    } else {
      return res.status(404).send(new NotFoundError(`User with id: '${userId}' was not found in the database.`));
    }
  } catch (error) {
    console.log("Error occurred while getting user: ", error);
    return res.status(500).send(new InternalServerError(`Unable to reach database.`));
  }
});

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
      console.log(error);
      return res.status(400).send(new ValidationError(error.errors[0]));
    } else {
      console.error("An error occurred retrieving the lost of market entries: ", error);
      return res.status(500).send(new InternalServerError());
    }
  }
});

router.patch("/users/:id/picture", validateUuidFromParams, cleanUserImageUrlObj, async (req: Request, res: Response) => {
    const userId = req.params.id;
    const pictureUrl = req.body.pictureUrl;

    // TODO: Check that id userId is the same as the token's userId
    // TODO: Validate pictureUrl

    try {
      const user: User | null = await User.findByPk(userId);
      if (user) {
        user.set({ pictureUrl });
        user.save();
        return res.status(202).send(user);
      } else {
        return res.status(404).send(new NotFoundError(`User with id: '${userId}' was not found in the database.`));
      }
    } catch (error) {
      console.log("Error occurred while getting user: ", error);
      return res.status(500).send(new InternalServerError(`Unable to reach database.`));
    }
  }
);

export { router as userRouter };
