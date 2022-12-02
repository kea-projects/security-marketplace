import { Request, Response, Router } from "express";
import { validateLoginRequestBody, validateSignupRequestBody } from "../middleware/bodyValidators";

const router: Router = Router();

router.post("/signup", validateSignupRequestBody, (req: Request, res: Response) => {
  const { username, password } = req.body;
  console.log("data", { username, password });
  // TODO: Make signup happen
  res.send({ notImplementedYet: "/auth/signup", body: req.body });
});

router.post("/login", validateLoginRequestBody, (req: Request, res: Response) => {
  // TODO: Make signup happen
  res.send({ notImplementedYet: "/auth/login", body: req.body });
});

export { router as authRouter };
