import chalk from "chalk";
import { Request, Response, Router } from "express";
import { validateCreateCommentRequestBody } from "../middleware/bodyValidators";
import { canAccessRoleUser } from "../middleware/validate-access.middleware";
import { CommentsService } from "../services/comments.service";
import { ListingsService } from "../services/listings.service";

const router: Router = Router();

router.post("", validateCreateCommentRequestBody, canAccessRoleUser, async (req: Request, res: Response) => {
  try {
    const token = req.body?.token;
    try {
      const foundListing = await ListingsService.findOne(req.body.commentedOn);
      if (!foundListing) {
        return res.status(404).send({ message: "Listing not found" });
      }
      if (!foundListing.isPublic && foundListing.createdBy !== (token?.userId as string)) {
        console.log(
          new Date().toISOString() + chalk.yellow(` [WARN] User tried to comment on another users private listing!`)
        );
        return res.status(404).send({ message: "Listing not found" });
      }
    } catch (error) {
      console.log(new Date().toISOString() + chalk.redBright(` [ERROR] Failed to find listing for a comment!`), error);
      return res.status(403).send({ message: "Forbidden" });
    }
    return res.status(201).send(await CommentsService.create({ ...req.body, createdBy: token?.userId as string }));
  } catch (error) {
    console.log(new Date().toISOString() + chalk.redBright(` [ERROR] Failed to create a comment!`), error);
    return res.status(403).send({ message: "Forbidden" });
  }
});

export { router as commentsRouter };
