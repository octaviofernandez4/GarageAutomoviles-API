import { Router } from "express";
import TradeInLead from "../models/TradeInLead.js";

const router = Router();

router.post("/", async (req, res) => {
  const { modelo, anio, km, telefono, estado, busca } = req.body;

  if (!modelo || !String(modelo).trim()) {
    return res.status(400).json({ error: "El modelo es obligatorio." });
  }

  const anioNum = Number(anio);
  if (!anio || Number.isNaN(anioNum) || anioNum < 1950 || anioNum > new Date().getFullYear() + 1) {
    return res.status(400).json({ error: "El año no es válido." });
  }

  if (!telefono || !String(telefono).trim()) {
    return res.status(400).json({ error: "El teléfono es obligatorio." });
  }

  try {
    const lead = await TradeInLead.create({
      modelo: String(modelo).trim(),
      anio: anioNum,
      km: km ? Number(String(km).replace(/\D/g, "")) : undefined,
      telefono: String(telefono).trim(),
      estado,
      busca,
    });

    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ error: "No pudimos guardar el pedido de tasación." });
  }
});

export default router;
