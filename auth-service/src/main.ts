import cors from "cors";
import express from "express";
import { authRouter } from "./routes/auth.routes";
import { initializeDb } from "./utils/init-database";

const app = express();
app.use(express.json());
// -----------------------CORS-------------------------
const corsOptions = {
  origin: "*",
  methods: ["POST"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

initializeDb();
// ---------------------Routers------------------------
app.use("/auth", authRouter);

// Reject all non defined paths
app.all("*", (_req, res) => {
  res.status(401).send();
});

// -------------------App-Launch-----------------------
const PORT: number = Number(process.env.APP_PORT) || 5000;
app.listen(PORT, () => {
  console.log(`Auth Service is running on port: ${PORT}`);
});
