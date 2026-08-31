import { Router } from "express";
import Vehicle from "../models/Vehicle.js";
import { requireAdmin } from "../utils/auth.js";

const router = Router();

const REQUIRED_FIELDS = [
  "id",
  "name",
  "brand",
  "body",
  "year",
  "price",
  "km",
  "engine",
  "gearbox",
  "auto",
  "fuel",
  "traction",
  "owners",
  "badge",
  "images",
];

function validateVehiclePayload(payload) {
  for (const field of REQUIRED_FIELDS) {
    const value = payload[field];
    if (value === undefined || value === null || value === "") {
      return `El campo "${field}" es obligatorio.`;
    }
  }
  if (!Array.isArray(payload.images) || payload.images.length === 0) {
    return "Tiene que haber al menos una foto.";
  }
  return null;
}

router.get("/", async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: 1 });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch vehicles" });
  }
});

router.get("/meta", async (req, res) => {
  try {
    const [brands, bodies, priceStats] = await Promise.all([
      Vehicle.distinct("brand"),
      Vehicle.distinct("body"),
      Vehicle.aggregate([
        { $group: { _id: null, min: { $min: "$price" }, max: { $max: "$price" } } },
      ]),
    ]);

    res.json({
      brands: brands.sort(),
      bodies: bodies.sort(),
      priceMin: priceStats[0]?.min ?? 0,
      priceMax: priceStats[0]?.max ?? 0,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch vehicle metadata" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ id: req.params.id });
    if (!vehicle) {
      return res.status(404).json({ error: "Vehículo no encontrado." });
    }
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch vehicle" });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  const error = validateVehiclePayload(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(vehicle);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Ya existe un vehículo con ese id." });
    }
    res.status(500).json({ error: "No pudimos crear el vehículo." });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  const error = validateVehiclePayload(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  try {
    const vehicle = await Vehicle.findOneAndUpdate({ id: req.params.id }, req.body, {
      new: true,
      runValidators: true,
    });
    if (!vehicle) {
      return res.status(404).json({ error: "Vehículo no encontrado." });
    }
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: "No pudimos actualizar el vehículo." });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndDelete({ id: req.params.id });
    if (!vehicle) {
      return res.status(404).json({ error: "Vehículo no encontrado." });
    }
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "No pudimos borrar el vehículo." });
  }
});

export default router;
