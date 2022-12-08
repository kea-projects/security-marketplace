import express, {Request, Response} from "express";
import cors from "cors";
import { initializeDb } from "./utils/init-database";
import { userRouter } from "./routes/user.routes";

const app = express();
app.use(express.json());
// -----------------------CORS-------------------------
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

initializeDb();
// ---------------------Routers------------------------
app.use(userRouter);

// ---------------------Default------------------------
// Reject all non defined paths
app.all("*", (req: Request, res: Response) => {
  console.log(`Invalid request: ${req.method} ${req.url}.`);
  console.log(`Request body: ${JSON.stringify(req.body)}`);
  console.log("Rejecting request.");

  res.status(401).send();
});

// -------------------App-Launch-----------------------

const PORT: number = Number(process.env.APP_PORT) || 5000;
app.listen(PORT, () => {
  console.log(`Backend App is running on port: ${PORT}`);
});
