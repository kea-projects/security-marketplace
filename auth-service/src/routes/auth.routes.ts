import { Request, Response, Router } from "express";
import { validateLoginRequestBody, validateSignupRequestBody } from "../middleware/bodyValidators";
import { canAccessRoleUser } from "../middleware/validate-access.middleware";
import { AuthUserService } from "../services/auth-user.service";
import { AuthenticationService } from "../services/authentication.service";
import { TokenService } from "../services/token.service";

const router: Router = Router();

router.post("/login", validateLoginRequestBody, async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const foundUser = await AuthUserService.findOneByUsername(username);
  if (!foundUser) {
    res.status(401).send({ message: "Unauthorized" });
    return;
  }
  if (!(await AuthenticationService.compareHashes(password, foundUser.password))) {
    res.status(401).send({ message: "Unauthorized" });
    return;
  }
  let tokens;
  try {
    tokens = await AuthenticationService.createAccessToken(foundUser.username, foundUser.role);
  } catch {}
  if (!tokens) {
    res
      .status(500)
      .send({ message: "Failed to authenticate the user due to an internal error. Please try again later." });
    return;
  }
  res.send({ accessToken: tokens?.accessToken, refreshToken: tokens?.refreshToken });
});

router.post("/signup", validateSignupRequestBody, async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (await AuthUserService.findOneByUsername(username)) {
    // TODO - discuss how to handle signup failed due to the email already being used, and the security implications of exposing this information
    res.status(409).send({
      message: "The email is already in use",
    });
    return;
  }
  const createdUser = await AuthUserService.create({ username, password });
  if (createdUser) {
    const tokens = await AuthenticationService.createAccessToken(createdUser.username, createdUser.role);
    if (tokens) {
      res.send({ accessToken: tokens?.accessToken, refreshToken: tokens?.refreshToken });
      return;
    }
  }
  res.status(500).send({ message: "Failed to create the user due to an internal error. Please try again later." });
  return;
});

router.get("/logout", canAccessRoleUser, async (req: Request, res: Response) => {
  const accessToken = AuthenticationService.getTokenFromRequest(req);
  if (!accessToken) {
    res.status(401).send({ message: "Unauthorized" });
  }
  const result = await TokenService.deleteByToken(accessToken!);
  if (result) {
    return res.status(202).send({ message: "Your access has been revoked" });
  }
  return res.status(401).send({ message: "Unauthorized" });
});

// TODO - accessToken middleware, logout and invalidate-all routes
// Examples of validating that the user has X role.
// router.get("/test/user", canAccessRoleUser, async (req: Request, res: Response) => {
//   res.send({ message: "You have user access" });
// });

// router.get("/test/admin", canAccessRoleAdmin, async (req: Request, res: Response) => {
//   res.send({ message: "You have admin access" });
// });

export { router as authRouter };
