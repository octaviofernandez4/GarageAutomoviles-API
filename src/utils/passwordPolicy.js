const MIN_LENGTH = 12;

const COMMON_PASSWORDS = new Set([
  "password",
  "12345678",
  "123456789",
  "qwerty123",
  "contraseña",
  "contrasena",
  "admin123",
  "letmein",
  "welcome1",
  "changeme",
  "cambiar-esta-clave",
]);

export function validatePassword(password, { email, name } = {}) {
  const pwd = String(password || "");
  const errors = [];

  if (pwd.length < MIN_LENGTH) {
    errors.push(`Debe tener al menos ${MIN_LENGTH} caracteres.`);
  }
  if (!/[a-z]/.test(pwd)) {
    errors.push("Debe incluir al menos una letra minúscula.");
  }
  if (!/[A-Z]/.test(pwd)) {
    errors.push("Debe incluir al menos una letra mayúscula.");
  }
  if (!/[0-9]/.test(pwd)) {
    errors.push("Debe incluir al menos un número.");
  }
  if (!/[^A-Za-z0-9]/.test(pwd)) {
    errors.push("Debe incluir al menos un símbolo (ej. ! @ # $ %).");
  }
  if (COMMON_PASSWORDS.has(pwd.toLowerCase())) {
    errors.push("Es una contraseña demasiado común.");
  }

  const lowerPwd = pwd.toLowerCase();
  const emailUser = email ? String(email).split("@")[0].toLowerCase() : "";
  if (emailUser && emailUser.length > 2 && lowerPwd.includes(emailUser)) {
    errors.push("No puede contener tu email.");
  }
  if (name && name.trim().length > 2 && lowerPwd.includes(name.trim().toLowerCase())) {
    errors.push("No puede contener tu nombre.");
  }

  return { valid: errors.length === 0, errors };
}
