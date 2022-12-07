import chalk from "chalk";
import { Request, Response, Router } from "express";
import { Role } from "../interfaces";
import { validateCreateListingRequestBody, validateUpdateListingRequestBody } from "../middleware/bodyValidators";
import { validateUuidFromParams } from "../middleware/path-param-validators";
import { canAccessRoleUser } from "../middleware/validate-access.middleware";
import { AuthenticationService } from "../services/authentication.service";
import { ListingsService } from "../services/listings.service";

const router: Router = Router();

router.get("", async (req: Request, res: Response) => {
  try {
    const token = AuthenticationService.getTokenFromRequest(req);

    if (token && token.role != Role.admin) {
      return res.send(await ListingsService.findByCreatedByOrPublic(token.userId as string));
    }
    return res.send(await ListingsService.findAll());
  } catch (error) {
    console.log(new Date().toISOString() + chalk.redBright(` [ERROR] Failed to get all listings!`), error);
    return res.status(403).send({ message: "Forbidden" });
  }
});

router.get("/:id", validateUuidFromParams, async (req: Request, res: Response) => {
  try {
    const foundListing = await ListingsService.findOne(req.params.id);
    if (!foundListing) {
      res.status(404).send({ message: "Listing not found" });
    } else {
      const token = AuthenticationService.getTokenFromRequest(req);

      if (token && token.role != Role.admin) {
        if (foundListing.createdBy === token.userId) {
          return res.send(foundListing);
        }
        console.log(
          new Date().toISOString() +
            chalk.yellowBright(` [WARN] User with id ${token?.sub} tried to access a listing of another user!`)
        );
        return res.status(403).send({ message: "Forbidden" });
      }

      return res.send(foundListing);
    }
  } catch (error) {
    console.log(
      new Date().toISOString() + chalk.redBright(` [ERROR] Failed to get a listing with id: ${req.params.id}`),
      error
    );
  }
  return res.status(403).send({ message: "Forbidden" });
});

router.patch(
  "/:id",
  validateUuidFromParams,
  canAccessRoleUser,
  validateUpdateListingRequestBody,
  async (req: Request, res: Response) => {
    try {
      const foundListing = await ListingsService.findOne(req.params.id);
      const token = AuthenticationService.getTokenFromRequest(req);

      if (token?.role != Role.admin && token?.sub != foundListing?.createdBy) {
        console.log(
          new Date().toISOString() +
            chalk.yellowBright(` [WARN] User with id ${token?.sub} tried to access a listing of another user!`)
        );
        return res.status(403).send({ message: "Forbidden" });
      }

      return res.send(await ListingsService.update(req.params.id, req.body));
    } catch (error) {
      console.log(new Date().toISOString() + chalk.redBright(` [ERROR] Failed to get a listing by id!`));
      return res.status(403).send({ message: "Forbidden" });
    }
  }
);

router.post("", canAccessRoleUser, validateCreateListingRequestBody, async (req: Request, res: Response) => {
  try {
    return res.send(await ListingsService.create(req.body));
  } catch (error) {
    console.log(new Date().toISOString() + chalk.redBright(` [ERROR] Failed to create a listing!`));
    return res.status(403).send({ message: "Forbidden" });
  }
});

router.delete("/:id", validateUuidFromParams, canAccessRoleUser, async (req: Request, res: Response) => {
  try {
    const foundListing = await ListingsService.findOne(req.params.id);
    const token = AuthenticationService.getTokenFromRequest(req);

    if (token?.role != Role.admin && token?.sub != foundListing?.createdBy) {
      console.log(
        new Date().toISOString() +
          chalk.yellowBright(` [WARN] User with id ${token?.sub} tried to delete a listing of another user!`)
      );
      return res.status(403).send({ message: "Forbidden" });
    }
    const result = await ListingsService.delete(req.params.id);
    if (result === 0) {
      console.log(
        new Date().toISOString() + chalk.yellowBright(` [WARN] Failed to delete a listing with id ${req.params.id}!`)
      );
      return res.status(403).send({ message: "Forbidden" });
    }
    if (result !== 1) {
      console.log(
        new Date().toISOString() + chalk.yellowBright(` [WARN] Deleted more than one listing with id ${req.params.id}!`)
      );
    }
    console.log(new Date().toISOString() + chalk.yellowBright(` [INFO] Deleted listing with id ${req.params.id}!`));
    return res.status(202).send({ message: "Deleted" });
  } catch (error) {
    console.log(new Date().toISOString() + chalk.redBright(` [ERROR] Failed to delete a listing by id!`));
    return res.status(403).send({ message: "Forbidden" });
  }
});

export { router as listingsRouter };
