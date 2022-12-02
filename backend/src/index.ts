import express from "express";
import cors from "cors";
import { initializeDb } from "./utils/init-database";
import { userRouter } from "./routes/user.routes";
import { listingRouter } from "./routes/marketEntry.routes";
import { authRouter } from "./routes/auth.routes";

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
app.use(authRouter);
app.use(listingRouter);
app.use(userRouter);

// ---------------------Default------------------------
app.get("/test", (_req, res) => {
  res.send({ hello: "WORLD!" });
});

// Reject all non defined paths
app.all("*", (_req, res) => {
  res.status(401).send();
});

// -------------------App-Launch-----------------------

const PORT: number = Number(process.env.APP_PORT) || 5000;
app.listen(PORT, () => {
  console.log(`Backend App is running on port: ${PORT}`);
});
