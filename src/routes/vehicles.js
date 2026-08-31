import { Router } from "express";
import Vehicle from "../models/Vehicle.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: 1 });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch vehicles" });
  }
});

export default router;
