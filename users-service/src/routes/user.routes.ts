import { Router } from "express";
import { Request, Response } from "express";
import { cleanUserObjFields } from "../middleware/bodyValidators";
import { User } from "../models/userModel";
import { InternalServerError, ValidationError, NotFoundError } from "../utils/error-messages";
import { validateUuidFromParams } from "../middleware/path-param-validators";
import { validate as isValidUuid } from "uuid";

const router: Router = Router();

router.post("/user", cleanUserObjFields, async (req: Request, res: Response) => {
  const user = req.body.user;
  if (!isValidUuid(user.userId)) {
    return res.status(400).send(new ValidationError(`Provided UUID: '${user.userId}' is not a valid UUIDv4.`));
  }

  try {
    await user.validate();
    const result = await user.save();
    return res.send(result);
  } catch (error) {
    console.log(error.errors);
    return res.send(new ValidationError(error.errors[0].message));
  }
});

router.get("/user", async (_req: Request, res: Response) => {
  try {
    const userList: User[] = await User.findAll();
    return res.status(200).send(userList);
  } catch (error) {
    console.log("Error occurred while getting user: ", error);
    return res.status(500).send(new InternalServerError(`Unable to reach database.`));
  }
});

router.get("/user/:id", validateUuidFromParams, async (req: Request, res: Response) => {
  const userId = req.params.id;

  console.log(`User Id: ${userId}`);

  try {
    const user = await User.findByPk(userId);
    if (user) {
      return res.status(200).send(user);
    } else {
      return res.status(404).send(new NotFoundError(`User with id: ${userId} was not found in the database.`));
    }
  } catch (error) {
    console.log("Error occurred while getting user: ", error);
    return res.status(500).send(new InternalServerError(`Unable to reach database.`));
  }
});

export { router as userRouter };
