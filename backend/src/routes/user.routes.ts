import { Router } from "express";
import { Request, Response } from "express";
import { cleanUserObjFields } from "../middleware/bodyValidators";
import { User } from "../models/userModel";
import { ValidationError } from "../utils/error-messages";

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


export { router as userRouter };
