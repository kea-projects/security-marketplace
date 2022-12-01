import { Router } from "express";
import { cleanMarketEntryFields } from "../middleware/bodyValidators";
import { MarketEntry } from "../models/marketEntryModel";
import { InternalServerError, ValidationError } from "../utils/error-messages";
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
      return res.status(400).send(new ValidationError(error.errors[0]));
    } else {
      return res.status(400).send(new ValidationError(`Foreign key '${marketEntry.userId}' was not found.`));
    }
  }

  return res.status(202).send(result);
});

router.get("/market-entry", async (_req: Request, res: Response) => {
  try {
    const userList: MarketEntry[] = await MarketEntry.findAll();
    return res.status(200).send(userList);
  } catch {
    console.error("An error occurred retrieving the lost of market entries");
    return res.status(500).send(new InternalServerError())
  }
});


export { router as marketEntryRouter };
