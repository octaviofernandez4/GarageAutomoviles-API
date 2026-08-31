import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import vehiclesRouter from "./routes/vehicles.js";
import tradeInRouter from "./routes/tradeIn.js";
import authRouter from "./routes/auth.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/vehicles", vehiclesRouter);
app.use("/api/trade-in", tradeInRouter);
app.use("/api/auth", authRouter);

async function start() {
  await connectDB();
  app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
