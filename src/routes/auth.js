import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import Admin from "../models/Admin.js";
import { signAdminToken, requireAdmin } from "../utils/auth.js";
import { validatePassword } from "../utils/passwordPolicy.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Probá de nuevo en 15 minutos." },
});

router.post("/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña son obligatorios." });
  }

  const admin = await Admin.findOne({ email: String(email).toLowerCase().trim() });
  if (!admin) {
    return res.status(401).json({ error: "Credenciales inválidas." });
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Credenciales inválidas." });
  }

  const token = signAdminToken(admin);
  res.json({ token, admin: { name: admin.name, email: admin.email } });
});

router.get("/me", requireAdmin, async (req, res) => {
  const admin = await Admin.findById(req.admin.sub).select("name email");
  if (!admin) {
    return res.status(401).json({ error: "Sesión inválida." });
  }
  res.json({ admin: { name: admin.name, email: admin.email } });
});

router.put("/password", requireAdmin, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Faltan datos." });
  }

  const admin = await Admin.findById(req.admin.sub);
  if (!admin) {
    return res.status(401).json({ error: "Sesión inválida." });
  }

  const currentValid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!currentValid) {
    return res.status(401).json({ error: "La contraseña actual no es correcta." });
  }

  const { valid, errors } = validatePassword(newPassword, { email: admin.email, name: admin.name });
  if (!valid) {
    return res.status(400).json({ error: errors.join(" ") });
  }

  admin.passwordHash = await bcrypt.hash(newPassword, 10);
  await admin.save();
  res.json({ ok: true });
});

export default router;
