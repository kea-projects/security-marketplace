import cors from "cors";
import { Request, Response, Router } from "express";
import { corsOptionsConfig, corsPostConfig } from "../config/cors.config";
import { Role } from "../interfaces";
import { validateCreateCommentRequestBody } from "../middleware/body-validators.middleware";
import { canAccessRoleUser } from "../middleware/validate-access.middleware";
import { CommentsService } from "../services/comments.service";
import { ListingsService } from "../services/listings.service";
import { log } from "../utils/logger";

const router: Router = Router();
// Add options requests
router.options("*", cors(corsOptionsConfig));

router.post(
  "",
  cors(corsPostConfig),
  validateCreateCommentRequestBody,
  canAccessRoleUser,
  async (req: Request, res: Response) => {
    try {
      const token = req.body?.token;

      const foundListing = await ListingsService.findOne(req.body.commentedOn);
      if (!foundListing) {
        log.info(`Failed comment creation since no matching listing was found!`);
        return res.status(404).send({ message: "Listing not found" });
      }
      if (
        token?.role !== Role.admin &&
        !foundListing.isPublic &&
        foundListing.createdBy !== (token?.userId as string)
      ) {
        log.warn(`User tried to comment on another users private listing!`);
        return res.status(404).send({ message: "Listing not found" });
      }

      return res.status(201).send(await CommentsService.create({ ...req.body, createdBy: token?.userId as string }));
    } catch (error) {
      log.error(`Failed to create a comment!`, error);
      return res.status(500).send({ message: "Internal Server Error - failed to create a comment." });
    }
  }
);

export { router as commentsRouter };
