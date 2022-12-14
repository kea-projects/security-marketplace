import cors from "cors";
import { Request, Response, Router } from "express";
import rateLimit from "express-rate-limit";
import { corsGetConfig, corsOptionsConfig, corsPostConfig } from "../config/cors.config";
import { rateLimiterAuthConfig } from "../config/rate-limiter.config";
import { validateLoginRequestBody, validateSignupRequestBody } from "../middleware/body-validators.middleware";
import { canAccessRoleUser } from "../middleware/validate-access.middleware";
import { AuthUserService } from "../services/auth-user.service";
import { AuthenticationService } from "../services/authentication.service";
import { TokenService } from "../services/token.service";
import { log } from "../utils/logger";

const router: Router = Router();
// Configure rate limiting
const loginLimiter = rateLimit(rateLimiterAuthConfig);
const signupLimiter = rateLimit(rateLimiterAuthConfig);
// Add options requests
router.options("*", cors(corsOptionsConfig));

/**
 * Validate that the provided credentials are valid, and return a access token pair if they do match a user.
 */
router.post(
  "/login",
  cors(corsPostConfig),
  loginLimiter,
  validateLoginRequestBody,
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      // Check that the user exists
      const foundUser = await AuthUserService.findOneByEmail(email);
      if (!foundUser) {
        log.warn(`Login attempt failed since no matching user was found: ${email}`);
        res.status(401).send({ message: "Unauthorized" });
        return;
      }

      if (!(await AuthenticationService.compareHashes(password, foundUser.password))) {
        log.warn(`Login attempt failed since the password hashes don't match: ${foundUser.userId}`);
        return res.status(401).send({ message: "Unauthorized" });
      }

      // Create a token pair
      log.trace(`Creating a token pair for user ${foundUser.userId}`);
      const tokens = await AuthenticationService.createAccessToken(foundUser.email, foundUser.userId, foundUser.role);
      if (!tokens) {
        log.warn(`Failed to create token pair for user ${foundUser.userId}`);
        return res
          .status(500)
          .send({ message: "Failed to authenticate the user due to an internal error. Please try again later." });
      }
      log.trace(`Token pair created for user ${foundUser.userId}`);
      return res.send({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
    } catch (error) {
      log.error(`An error has occurred while logging in a user!`, error);
      return res.status(500).send({ message: "Internal Server Error - failed to log in." });
    }
  }
);

router.post(
  "/signup",
  cors(corsPostConfig),
  signupLimiter,
  validateSignupRequestBody,
  async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;
      // Check if there is already a registered user with the same email
      if (await AuthUserService.findOneByEmail(email)) {
        log.warn(`Signup attempt failed due to the email already being in use: ${email}`);
        return res.status(409).send({
          message: "The email is already in use",
        });
      }

      // Register a new user
      log.trace(`Creating a user as part of the signup process`);
      const createdUser = await AuthUserService.create({ name, email, password });
      if (!createdUser) {
        log.warn("Failed to create a auth user object!");
        return res.status(401).send({ message: "Unauthorized" });
      }

      // Create a access token pair
      log.trace(`Creating a token pair for user ${createdUser.userId}`);
      const tokens = await AuthenticationService.createAccessToken(
        createdUser.email,
        createdUser.userId,
        createdUser.role
      );
      if (!tokens) {
        log.warn("Failed to create a token pair for a newly registered user!");
        return res.status(401).send({ message: "Unauthorized" });
      }

      log.trace(`User ${createdUser.userId} has been signed up`);
      return res.send({ accessToken: tokens?.accessToken, refreshToken: tokens?.refreshToken });
    } catch (error) {
      log.error(`An error has occurred while signing up!`, error);
      return res.status(500).send({ message: "Internal Server Error - failed to register a new user." });
    }
  }
);

router.post("/logout", cors(corsGetConfig), canAccessRoleUser, async (req: Request, res: Response) => {
  try {
    const accessToken = AuthenticationService.getTokenFromRequest(req);
    // Check if the token is valid
    if (!accessToken) {
      log.warn(`Failed to log out a user to due missing access token`);
      return res.status(401).send({ message: "Unauthorized" });
    }

    // Delete the token pair
    log.trace(`Trying to delete a token pair as part of the logout process for token: ${accessToken}`);
    const result = await TokenService.deleteByToken(accessToken);
    if (!result) {
      log.warn(`Failed to find and/or delete a token pair of token ${accessToken}`);
      return res.status(401).send({ message: "Unauthorized" });
    }

    log.trace(`Token pair has been deleted`);
    return res.status(202).send({ message: "Your access has been revoked" });
  } catch (error) {
    log.error(`An error has occurred while logging the user out!`, error);
    return res.status(500).send({ message: "Internal Server Error - failed to log you out." });
  }
});

router.post("/refresh", cors(corsPostConfig), canAccessRoleUser, async (req: Request, res: Response) => {
  try {
    log.trace(`Refreshing a token pair`);
    // Remove old access token pair
    const accessToken = AuthenticationService.getTokenFromRequest(req);
    if (!accessToken) {
      log.info(`Failed to refresh a token pair since it is missing from the database`);
      return res.status(401).send({ message: "Unauthorized" });
    }
    log.trace(`Deleting token ${accessToken}`);
    const result = await TokenService.deleteByToken(accessToken);
    if (!result) {
      log.warn(`Failed to delete a token pair!`);
      return res.status(401).send({ message: "Unauthorized" });
    }

    // Create new access token pair
    const token = AuthenticationService.decodeToken(accessToken);
    const foundUser = await AuthUserService.findOneByEmail(token?.sub as string);
    if (!foundUser) {
      log.warn(`Failed to create a new token since the related user was not found in the database`);
      return res.status(401).send({ message: "Unauthorized" });
    }
    log.trace(`Creating a new token pair for user ${foundUser.userId}`);
    const tokens = await AuthenticationService.createAccessToken(foundUser.email, foundUser.userId, foundUser.role);
    if (!tokens) {
      log.warn(`Failed to create new access token pair!`);
      return res
        .status(500)
        .send({ message: "Failed to authenticate the user due to an internal error. Please try again later." });
    }
    log.trace(`Returning a new token pair for user ${foundUser.userId}`);
    return res.send({ accessToken: tokens?.accessToken, refreshToken: tokens?.refreshToken });
  } catch (error) {
    log.error(`An error has occurred refreshing a token!`, error);
    return res.status(500).send({ message: "Internal Server Error - failed to refresh the token." });
  }
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
    // TODO - revisit this logic and decide on the exact condition
    if (!isValid || !foundTokens) {
      const decodedToken = AuthenticationService.decodeToken(token);
      await TokenService.deleteAllOfUser(decodedToken?.sub as string);
      log.warn(`Removed all tokens of a user: ${decodedToken?.sub as string}`);
      return res.status(401).send({ message: "Unauthorized" });
    }

    return res.status(200).send({ message: "Token is valid", token: AuthenticationService.decodeToken(token) });
  } catch (error) {
    log.error(`An error occurred while validating a token!`, error);
    return res.status(500).send({ message: "Internal Server Error - failed to validate the token." });
  }
});

export { router as authRouter };
