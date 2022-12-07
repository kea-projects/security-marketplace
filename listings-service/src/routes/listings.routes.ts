import chalk from "chalk";
import { Request, Response, Router } from "express";
import { Role } from "../interfaces";
import { validateUpdateListingRequestBody } from "../middleware/bodyValidators";
import { validateUuidFromParams } from "../middleware/path-param-validators";
import { canAccessRoleUser } from "../middleware/validate-access.middleware";
import { AuthenticationService } from "../services/authentication.service";
import { ListingsService } from "../services/listings.service";

const router: Router = Router();

router.get("", async (_req: Request, res: Response) => {
  return res.send(await ListingsService.findAll());
});

router.get("/:id", validateUuidFromParams, async (req: Request, res: Response) => {
  const foundListing = await ListingsService.findOne(req.params.id);
  if (!foundListing) {
    res.status(404).send({ message: "Listing not found" });
  } else {
    res.send(foundListing);
  }
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

      //return res.send(await ListingsService.update(req.params.id, req.body));
      const isUpdated = await ListingsService.update(req.params.id, req.body);
      console.log("done with update");

      return res.send(await ListingsService.findOne(req.params.id));
    } catch (error) {
      console.log(new Date().toISOString() + chalk.redBright(` [ERROR] Failed to get a listing by id!`));

      return res.status(403).send({ message: "Forbidden" });
    }
  }
);

export { router as listingsRouter };
