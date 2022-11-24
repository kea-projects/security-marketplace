import { Router } from "express";
import { cleanMarketEntryFields } from "../middleware/bodyValidators";
import { MarketEntry } from "../models/marketEntryModel";
import { ValidationError } from "../utils/error-messages";
import { Request, Response } from "express";

const router: Router = Router();

router.post("/market-entry", cleanMarketEntryFields, async (req: Request, res: Response) => {
  const marketEntry = new MarketEntry({
    userId: req.body.userId!,
    title: req.body.title!,
    content: req.body.content!,
  });

  let result;
  try {
    result = await marketEntry.save();
  } catch (error) {
    if (error.errors) {
      return res.status(422).send(new ValidationError(error.errors[0]));
    } else {
      return res.status(422).send(new ValidationError(`Foreign key '${marketEntry.userId}' was not found`));
    }
  }

  return res.status(202).send(result);
});

router.get("/market-entry", async (_req: Request, res: Response) => {
  const userList = await MarketEntry.findAll();
  res.send(userList);
});

router.get("/read", async (_req, res) => {
  const idk = await MarketEntry.findAll();

  res.send(idk);
});

export { router as marketEntryRouter };
