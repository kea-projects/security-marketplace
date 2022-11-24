import express from "express";
import cors from "cors";


const app = express();

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}
app.use(cors(corsOptions));

app.get("/test", (_req, res) => {
  res.send({ hello: "WORLD!" });
});




// Reject all non defined paths
app.all('*', (_req, res) => {
    res.status(401).send()
})




const PORT: number = Number(process.env.APP_PORT) || 5000;
app.listen(PORT, () => {
  console.log(`Backend App is running on port: ${PORT}`);
});
