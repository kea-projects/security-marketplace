import { Request, Response, Router } from "express";

const router: Router = Router();

router.post("/signup", (req: Request, res: Response) => {
  // TODO: Make signup happen
  res.send({ notImplementedYet: "/auth/signup", body: req.body });
});

router.post("/login", (req: Request, res: Response) => {
  // TODO: Make signup happen
  res.send({ notImplementedYet: "/auth/login", body: req.body });
});

export { router as authRouter };
