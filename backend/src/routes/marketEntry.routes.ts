import { Router } from "express";
import { cleanMarketEntryFields } from "../middleware/bodyValidators";
import { MarketEntry } from "../models/marketEntryModel";
import { ValidationError } from "../utils/error-messages";

const router: Router = Router();

router.post("/market-entry", cleanMarketEntryFields, async (req, res) => {
  const marketEntry = new MarketEntry({
    title: req.body.title!,
    content: req.body.content!,
  });

  let error_obj = undefined;

  let result;
  try {
    error_obj = await marketEntry.validate();
    result = await marketEntry.save();
  } catch (error) {
    console.log(error.errors);
    res.send(new ValidationError(error.errors[0].message));
  }

  if (error_obj === null) {
    res.status(202).send({ status: "success", body: marketEntry });
  }

  res.send(result);
});

router.get("/market-entry", async (_req, res) => {
  const userList = await MarketEntry.findAll();
  res.send(userList);
});

router.get("/read", async (_req, res) => {
  const idk = await MarketEntry.findAll();

  res.send(idk);
});

export { router as marketEntryRouter };
