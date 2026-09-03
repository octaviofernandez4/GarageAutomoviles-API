import { Router } from "express";
import TradeInLead from "../models/TradeInLead.js";
import { sendWhatsAppNotification } from "../utils/whatsapp.js";
import { sendEmailNotification } from "../utils/email.js";
import { requireAdmin } from "../utils/auth.js";

const router = Router();

router.post("/", async (req, res) => {
  const { modelo, anio, km, telefono, estado, historial, neumaticos, busca, detalles, vehiculoId, vehiculoNombre } =
    req.body;

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
      historial,
      neumaticos,
      busca,
      detalles,
      vehiculoId: vehiculoId || undefined,
      vehiculoNombre: vehiculoNombre || undefined,
    });

    try {
      await sendWhatsAppNotification(lead);
    } catch (err) {
      console.error("Error al enviar notificación de WhatsApp:", err);
    }

    try {
      await sendEmailNotification(lead);
    } catch (err) {
      console.error("Error al enviar notificación por email:", err);
    }

    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ error: "No pudimos guardar el pedido de tasación." });
  }
});

router.get("/admin", requireAdmin, async (req, res) => {
  try {
    const leads = await TradeInLead.find().sort({ createdAt: -1 }).limit(300);
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: "No pudimos cargar las tasaciones." });
  }
});

export default router;
