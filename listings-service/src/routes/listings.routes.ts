import { Request, Response, Router } from "express";
import { ListingsService } from "../services/listings.service";

const router: Router = Router();

router.get("", async (_req: Request, res: Response) => {
  return res.send(await ListingsService.findAll());
});

export { router as listingsRouter };
