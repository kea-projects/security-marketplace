import { Router } from "express";
import { Request, Response } from "express";

const router: Router = Router();

router.post("/auth/signup", (req: Request, res: Response) => {
    // TODO: Make signup happen
    res.send({notImplementedYet: "/auth/signup", body: req.body})
})

router.post("/auth/login", (req: Request, res: Response) => {
    // TODO: Make signup happen
    res.send({notImplementedYet: "/auth/login", body: req.body})
})



export {router as authRouter}