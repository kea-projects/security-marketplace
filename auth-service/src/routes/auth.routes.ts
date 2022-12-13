import { Request, Response, Router } from "express";
import { validateLoginRequestBody, validateSignupRequestBody } from "../middleware/bodyValidators";
import { canAccessRoleUser } from "../middleware/validate-access.middleware";
import { AuthUserService } from "../services/auth-user.service";
import { AuthenticationService } from "../services/authentication.service";
import { TokenService } from "../services/token.service";
import { log } from "../utils/logger";

const router: Router = Router();

router.post("/login", validateLoginRequestBody, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const foundUser = await AuthUserService.findOneByEmail(email);
    if (!foundUser) {
      log.info(`Login attempt failed since no matching user was found: ${email}`);
      res.status(401).send({ message: "Unauthorized" });
      return;
    }
    if (!(await AuthenticationService.compareHashes(password, foundUser.password))) {
      log.info(`Login attempt failed since the password hashes don't match: ${foundUser.userId}`);
      return res.status(401).send({ message: "Unauthorized" });
    }
    let tokens;
    try {
      log.trace(`Creating a token pair for user ${foundUser.userId}`);
      tokens = await AuthenticationService.createAccessToken(foundUser.email, foundUser.userId, foundUser.role);
    } catch {}
    if (!tokens) {
      log.warn(`Failed to create token pair for user ${foundUser.userId}`);
      return res
        .status(500)
        .send({ message: "Failed to authenticate the user due to an internal error. Please try again later." });
    }
    log.trace(`Token pair created for user ${foundUser.userId}`);
    return res.send({ accessToken: tokens!.accessToken, refreshToken: tokens!.refreshToken });
  } catch (error) {
    log.error(`An error has occurred while logging in a user!`, error);
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
      log.info(`Signup attempt failed due to the email already being in use: ${email}`);
      res.status(409).send({
        message: "The email is already in use",
      });
      return;
    }
    log.trace(`Creating a user as part of the signup process`);
    const createdUser = await AuthUserService.create({ name, email, password });
    if (createdUser) {
      log.trace(`Creating a token pair for user ${createdUser.userId}`);
      const tokens = await AuthenticationService.createAccessToken(
        createdUser.email,
        createdUser.userId,
        createdUser.role
      );
      if (tokens) {
        log.trace(`User ${createdUser.userId} has been signed up`);
        return res.send({ accessToken: tokens?.accessToken, refreshToken: tokens?.refreshToken });
      }
    }
  } catch (error) {
    log.error(`An error has occurred while signing up!`, error);
    return res
      .status(500)
      .send({ message: "Failed to create the user due to an internal error. Please try again later." });
  }
  log.warn(`Failed to complete signup of a user`);
  return res.status(401).send({ message: "Unauthorized" });
});

router.get("/logout", canAccessRoleUser, async (req: Request, res: Response) => {
  const accessToken = AuthenticationService.getTokenFromRequest(req);
  if (!accessToken) {
    log.info(`Failed to log out a user to due missing access token`);
    return res.status(401).send({ message: "Unauthorized" });
  }
  log.trace(`Trying to delete a token pair as part of the logout process for token: ${accessToken}`);
  const result = await TokenService.deleteByToken(accessToken!);
  if (result) {
    log.trace(`Token pair has been deleted`);
    return res.status(202).send({ message: "Your access has been revoked" });
  }
  log.warn(`Failed to find and/or delete a token pair of token ${accessToken}`);
  return res.status(401).send({ message: "Unauthorized" });
});

router.post("/refresh", canAccessRoleUser, async (req: Request, res: Response) => {
  try {
    log.trace(`Refreshing a token pair`);
    let accessToken;
    // Remove old access token pair
    try {
      accessToken = AuthenticationService.getTokenFromRequest(req);
      if (!accessToken) {
        log.info(`Failed to refresh a token pair since it is missing from the database`);
        return res.status(401).send({ message: "Unauthorized" });
      }
      log.trace(`Deleting token ${accessToken}`);
      const result = await TokenService.deleteByToken(accessToken!);
      if (!result) {
        log.warn(`Failed to delete a token pair!`);
        return res.status(401).send({ message: "Unauthorized" });
      }
    } catch (error) {
      log.error(`An error occurred while deleting a token!`, error);
      return res.status(401).send({ message: "Unauthorized" });
    }
    // Create new access token pair
    const token = AuthenticationService.decodeToken(accessToken);
    const foundUser = await AuthUserService.findOneByEmail(token!.sub!);
    if (!foundUser) {
      log.warn(`Failed to create a new token since the related user was not found in the database`);
      return res.status(401).send({ message: "Unauthorized" });
    }
    let tokens;
    try {
      log.trace(`Creating a new token pair for user ${foundUser.userId}`);
      tokens = await AuthenticationService.createAccessToken(foundUser.email, foundUser.userId, foundUser.role);
    } catch {}
    if (!tokens) {
      log.warn(`Failed to create new access token pair!`);
      return res
        .status(500)
        .send({ message: "Failed to authenticate the user due to an internal error. Please try again later." });
    }
    log.trace(`Returning a new token pair for user ${foundUser.userId}`);
    return res.send({ accessToken: tokens?.accessToken, refreshToken: tokens?.refreshToken });
  } catch (error) {
    log.error(`An error has occurred refreshing a token!`);
  }
  log.warn(`Failed to refresh a token pair`);
  return res.status(401).send({ message: "Unauthorized" });
});

router.post("/validate", async (req: Request, res: Response) => {
  try {
    // Extract the token
    const token = AuthenticationService.getTokenFromRequest(req);
    if (!token) {
      log.warn(`Tried to validate a non-existent token!`);
      return res.status(401).send({ message: "Unauthorized" });
    }
    // Check if token is valid. If not, see if it exists in the DB and wipe all tokens of the given user
    const isValid = AuthenticationService.isValidToken(token);
    if (!isValid) {
      log.warn(`Failed validation for an invalid token!`);
    }
    // Check if token exists in the database
    const foundTokens = await TokenService.findByToken(token);
    if (!foundTokens) {
      log.warn(`Validated token that doesn't exist in the database!`);
    }
    // Remove all tokens of given user if previous validation has failed
    if (!isValid || !foundTokens) {
      try {
        const decodedToken = AuthenticationService.decodeToken(token);
        await TokenService.deleteAllOfUser(decodedToken!.sub!);
        log.warn(`Removed all tokens of a user: ${decodedToken!.sub}`);
      } catch (error) {
        log.error(`Failed to delete all tokens of a user from the database!`, error);
      }
      return res.status(401).send({ message: "Unauthorized" });
    }
    // Confirm that the token is OK
    return res.status(200).send({ message: "Token is valid", token: AuthenticationService.decodeToken(token) });
  } catch (error) {
    log.error(`An error occurred while validating a token!`, error);
    return res.status(401).send({ message: "Unauthorized" });
  }
});

export { router as authRouter };
