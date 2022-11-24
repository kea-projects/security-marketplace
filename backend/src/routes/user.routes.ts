import { Router } from "express";
import { cleanUserObjFields } from "../middleware/bodyValidators";
import { User } from "../models/userModel";
import { ValidationError } from "../utils/error-messages";

const router: Router = Router();

router.post("/user", cleanUserObjFields, async (req, res) => {
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

router.get("/user", async (_req, res) => {
  const userList = await User.findAll();
  res.send(userList);
});

router.get("/read", async (_req, res) => {
  const idk = await User.findAll();

  res.send(idk);
});

export { router as userRouter };
