import chalk from "chalk";
import { Request, Response, Router } from "express";
import { validateLoginRequestBody, validateSignupRequestBody } from "../middleware/bodyValidators";
import { canAccessRoleUser } from "../middleware/validate-access.middleware";
import { AuthUserService } from "../services/auth-user.service";
import { AuthenticationService } from "../services/authentication.service";
import { TokenService } from "../services/token.service";

const router: Router = Router();

router.post("/login", validateLoginRequestBody, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const foundUser = await AuthUserService.findOneByEmail(email);
    if (!foundUser) {
      res.status(401).send({ message: "Unauthorized" });
      return;
    }
    if (!(await AuthenticationService.compareHashes(password, foundUser.password))) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    let tokens;
    try {
      tokens = await AuthenticationService.createAccessToken(foundUser.email, foundUser.userId, foundUser.role);
    } catch {}
    if (!tokens) {
      return res
        .status(500)
        .send({ message: "Failed to authenticate the user due to an internal error. Please try again later." });
    }
    return res.send({ accessToken: tokens!.accessToken, refreshToken: tokens!.refreshToken });
  } catch (error) {
    console.log(
      new Date().toISOString() + chalk.redBright(` [ERROR] An error has occurred while logging in a user!`, error)
    );
    return res.status(500).send({ message: "Failed to login due to an internal error. Please try again later." });
  }
});

router.post("/signup", validateSignupRequestBody, async (req: Request, res: Response) => {
  try {
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
    const createdUser = await AuthUserService.create({ name, email, password });
    if (createdUser) {
      const tokens = await AuthenticationService.createAccessToken(
        createdUser.email,
        createdUser.userId,
        createdUser.role
      );
      if (tokens) {
        return res.send({ accessToken: tokens?.accessToken, refreshToken: tokens?.refreshToken });
      }
    }
  } catch (error) {
    console.log(new Date().toISOString() + chalk.redBright(` [ERROR] An error has occurred while signing up!`, error));
    return res
      .status(500)
      .send({ message: "Failed to create the user due to an internal error. Please try again later." });
  }
  return res.status(401).send({ message: "Unauthorized" });
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

router.post("/validate", async (req: Request, res: Response) => {
  try {
    // Extract the token
    const token = AuthenticationService.getTokenFromRequest(req);
    if (!token) {
      console.log(new Date().toISOString() + chalk.yellow(` [WARN] Tried to validate a non-existent token!`));
      return res.status(401).send({ message: "Unauthorized" });
    }
    // Check if token is valid. If not, see if it exists in the DB and wipe all tokens of the given user
    const isValid = AuthenticationService.isValidToken(token);
    if (!isValid) {
      console.log(new Date().toISOString() + chalk.yellow(` [WARN] Failed validation for an invalid token!`));
    }
    // Check if token exists in the database
    const foundTokens = await TokenService.findByToken(token);
    if (!foundTokens) {
      console.log(
        new Date().toISOString() + chalk.yellow(` [WARN] Validated token that doesn't exist in the database!`)
      );
    }
    // Remove all tokens of given user if previous validation has failed
    if (!isValid || !foundTokens) {
      try {
        const decodedToken = AuthenticationService.decodeToken(token);
        await TokenService.deleteAllOfUser(decodedToken!.sub!);
        console.log(
          new Date().toISOString() + chalk.yellow(` [WARN] Removed all tokens of a user: ${decodedToken!.sub}`)
        );
      } catch (error) {
        console.log(
          new Date().toISOString() +
            chalk.redBright(` [ERROR] Failed to delete all tokens of a user from the database!`)
        );
      }
      return res.status(401).send({ message: "Unauthorized" });
    }
    // Confirm that the token is OK
    return res.status(200).send({ message: "Token is valid", token: AuthenticationService.decodeToken(token) });
  } catch (error) {
    console.log(
      new Date().toISOString() + chalk.redBright(` [ERROR] An error occurred while validating a token!}`),
      error
    );
    return res.status(401).send({ message: "Unauthorized" });
  }
});

export { router as authRouter };
