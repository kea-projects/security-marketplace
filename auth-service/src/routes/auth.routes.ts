import { Request, Response, Router } from "express";
import { validateLoginRequestBody, validateSignupRequestBody } from "../middleware/bodyValidators";
import { AuthUserService } from "../services/auth-user.service";
import { AuthenticationService } from "../services/authentication.service";

const router: Router = Router();

router.post("/signup", validateSignupRequestBody, async (req: Request, res: Response) => {
  const { username, password } = req.body;
  console.log("data", { username, password });
  if (await AuthUserService.findOne(username)) {
    // TODO - discuss how to handle signup failed due to the email already being used, and the security implications of exposing this information
    res.status(409).send({
      message: "The email is already in use",
    });
  }
  const createdUser = await AuthUserService.create({ username, password });
  res.send({ accessToken: AuthenticationService.createAccessToken(createdUser.username) });
});

router.post("/login", validateLoginRequestBody, (req: Request, res: Response) => {
  // TODO: Make signup happen
  res.send({ notImplementedYet: "/auth/login", body: req.body });
});

export { router as authRouter };
