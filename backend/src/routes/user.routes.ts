import { Router } from "express";
import { Request, Response } from "express";
import { cleanUserObjFields } from "../middleware/bodyValidators";
import { User } from "../models/userModel";
import { ValidationError } from "../utils/error-messages";
import { validateUuidFromParams } from "../utils/path-param-validators";

const router: Router = Router();

router.post("/user", cleanUserObjFields, async (req: Request, res: Response) => {
  const user = new User({
    username: req.body.username!,
    password: req.body.password!,
    fullName: req.body.fullName!,
  });

  let is_valid = undefined;

  let result;
  try {
    is_valid = await user.validate();
    result = await user.save();
  } catch (error) {
    console.log(error.errors);
    res.send(new ValidationError(error.errors[0].message));
  }

  if (is_valid === null) {
    res.status(202).send({ status: "success", body: user });
  }

  res.send(result);
});

router.get("/user", async (_req: Request, res: Response) => {
  const userList = await User.findAll();
  res.send(userList);
});

router.get("/user/:id", async (req: Request, res: Response) => {
  const userId = validateUuidFromParams("id", req, res);
  if (userId !== true) return;

  console.log(`User Id: ${userId}`);

  const userList = await User.findAll({
    where: {
      id: userId,
    },
  });
  console.log("UserList is: ", userList);

  res.send(userList);
});

export { router as userRouter };
