import chalk from "chalk";
import { Request, Response, Router } from "express";
import { validateLoginRequestBody, validateSignupRequestBody } from "../middleware/bodyValidators";
import { canAccessRoleUser } from "../middleware/validate-access.middleware";
import { AuthUserService } from "../services/auth-user.service";
import { AuthenticationService } from "../services/authentication.service";
import { TokenService } from "../services/token.service";

const router: Router = Router();

router.post("/login", validateLoginRequestBody, async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const foundUser = await AuthUserService.findOneByEmail(email);
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
    tokens = await AuthenticationService.createAccessToken(foundUser.email, foundUser.userId, foundUser.role);
  } catch {
    // TODO - write the catch
  }
  if (!tokens) {
    res
      .status(500)
      .send({ message: "Failed to authenticate the user due to an internal error. Please try again later." });
    return;
  }
  // TODO - Wrap the entire thing in a try catch
  // TODO - get rid of the question marks
  res.send({ accessToken: tokens?.accessToken, refreshToken: tokens?.refreshToken });
});

router.post("/signup", validateSignupRequestBody, async (req: Request, res: Response) => {
  // TODO - emails can only have: utf-8-mb4, dashes, spaces, apostrophe. No russian or ukrainian or belarus
  // TODO - passwords must have one lowercase, one uppercase, one number, one special. min 8, 32 max.
  const { name, email, password } = req.body;
  if (await AuthUserService.findOneByEmail(email)) {
    // TODO - discuss how to handle signup failed due to the email already being used, and the security implications of exposing this information
    res.status(409).send({
      message: "The email is already in use",
    });
    return;
  }
  // TODO - try catch this stuff
  const createdUser = await AuthUserService.create({ name, email, password });
  if (createdUser) {
    const tokens = await AuthenticationService.createAccessToken(
      createdUser.email,
      createdUser.userId,
      createdUser.role
    );
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
    return res.status(401).send({ message: "Unauthorized" });
  }
  const result = await TokenService.deleteByToken(accessToken!);
  if (result) {
    return res.status(202).send({ message: "Your access has been revoked" });
  }
  return res.status(401).send({ message: "Unauthorized" });
});

// TODO - the access middlewares need to verify that the token does exist in the DB
// TODO - when trying to access the system using a deleted token, invalidate all of the users tokens
router.post("/refresh", canAccessRoleUser, validateLoginRequestBody, async (req: Request, res: Response) => {
  try {
    // Remove old access token pair
    try {
      const accessToken = AuthenticationService.getTokenFromRequest(req);
      if (!accessToken) {
        return res.status(401).send({ message: "Unauthorized" });
      }
      const result = await TokenService.deleteByToken(accessToken!);
      if (!result) {
        console.log(new Date().toISOString() + chalk.yellowBright(` [WARN] Failed to delete a token pair!`));
        return res.status(401).send({ message: "Unauthorized" });
      }
    } catch (error) {
      console.log(
        new Date().toISOString() + chalk.redBright(` [ERROR] An error occurred while deleting a token!`),
        error
      );
      return res.status(401).send({ message: "Unauthorized" });
    }
    // Create new access token pair
    const { email, password } = req.body;
    const foundUser = await AuthUserService.findOneByEmail(email);
    if (!foundUser) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    if (!(await AuthenticationService.compareHashes(password, foundUser.password))) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    let tokens;
    try {
      tokens = await AuthenticationService.createAccessToken(foundUser.email, foundUser.userId, foundUser.role);
    } catch {}
    if (!tokens) {
      console.log(new Date().toISOString() + chalk.yellowBright(` [WARN] Failed to create new access token pair!`));
      return res
        .status(500)
        .send({ message: "Failed to authenticate the user due to an internal error. Please try again later." });
    }
    return res.send({ accessToken: tokens?.accessToken, refreshToken: tokens?.refreshToken });
  } catch (error) {
    console.log(
      new Date().toISOString() + chalk.redBright(` [ERROR] An error has occurred refreshing a token!`, error.stack)
    );
  }
  return res.status(401).send({ message: "Unauthorized" });
});

export { router as authRouter };
