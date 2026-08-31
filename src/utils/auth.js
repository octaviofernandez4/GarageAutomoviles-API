import jwt from "jsonwebtoken";

const SEVEN_DAYS = "7d";

export function signAdminToken(admin) {
  return jwt.sign({ sub: admin._id.toString(), email: admin.email }, process.env.JWT_SECRET, {
    expiresIn: SEVEN_DAYS,
  });
}

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "No autenticado." });
  }

  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: "Sesión inválida o expirada." });
  }
}
