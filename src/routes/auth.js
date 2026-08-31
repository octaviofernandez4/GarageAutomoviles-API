import { Router } from "express";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import { signAdminToken, requireAdmin } from "../utils/auth.js";

const router = Router();

router.post("/login", async (req, res) => {
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

export default router;
