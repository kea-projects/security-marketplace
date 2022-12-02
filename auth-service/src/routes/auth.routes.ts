import { Request, Response, Router } from "express";
import { validateLoginRequestBody, validateSignupRequestBody } from "../middleware/bodyValidators";
import { AuthUserService } from "../services/auth-user.service";
import { AuthenticationService } from "../services/authentication.service";

const router: Router = Router();

router.post("/signup", validateSignupRequestBody, async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (await AuthUserService.findOneByUsername(username)) {
    // TODO - discuss how to handle signup failed due to the email already being used, and the security implications of exposing this information
    res.status(409).send({
      message: "The email is already in use",
    });
  }
  const createdUser = await AuthUserService.create({ username, password });
  if (createdUser) {
    res.send({ accessToken: AuthenticationService.createAccessToken(createdUser.username) });
  } else {
    res.status(500).send({ message: "Failed to create the user due to an internal error. Please try again later." });
  }
});

router.post("/login", validateLoginRequestBody, async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const foundUser = await AuthUserService.findOneByUsernameAndPassword(username, password);
  if (!foundUser) {
    res.status(401).send({ message: "Unauthorized" });
    return;
  }
  res.send({ accessToken: AuthenticationService.createAccessToken(foundUser.username) });
});

export { router as authRouter };
