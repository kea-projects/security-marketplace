import { Router } from "express";
import { Request, Response } from "express";
import { cleanUserObjFields } from "../middleware/bodyValidators";
import { User } from "../models/userModel";
import { ValidationError } from "../utils/error-messages";
import { validateUuidFromParams } from "../middleware/path-param-validators";

const router: Router = Router();

router.post("/user", cleanUserObjFields, async (req: Request, res: Response) => {
  const user: User = req.body.user;

  try {
    await user.validate();
    const result = await user.save();
    // TODO: Filter out user_id and password
    return res.send(result);
  } catch (error) {
    console.log(error.errors);
    return res.send(new ValidationError(error.errors[0].message));
  }
});

router.get("/user", async (_req: Request, res: Response) => {
  try {
    const userList: User[] = await User.findAll();
    return res.status(200).send({ userList });
  } catch (error) {
    const userList: User[] = [];
    console.error("An error has occured: ", error);
    return res.status(200).send({ userList });
  }
});

router.get("/user/:id", validateUuidFromParams, async (req: Request, res: Response) => {
  const userId = req.body.id;

  console.log(`User Id: ${userId}`);

  // TODO: Make work the request
  const userList = await User.findAll({
    where: {
      id: userId,
    },
  });
  console.log("UserList is: ", userList);

  res.send(userList);
});

export { router as userRouter };
