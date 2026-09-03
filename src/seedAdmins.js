import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "./db.js";
import Admin from "./models/Admin.js";
import { validatePassword } from "./utils/passwordPolicy.js";

// Editá esta lista con los datos reales antes de correr `npm run seed:admins`.
const admins = [
  { name: "Octavio", email: "octavio@elgarage.com", password: "cambiar-esta-clave" },
  { name: "Dueño", email: "dueno@elgarage.com", password: "cambiar-esta-clave" },
  { name: "Carlos", email: "carlos@elgarage.com", password: "cambiar-esta-clave" },
];

async function run() {
  await connectDB();

  for (const { name, email, password } of admins) {
    const { valid, errors } = validatePassword(password, { email, name });
    if (!valid) {
      console.error(`Contraseña insegura para ${email}:`);
      errors.forEach((e) => console.error(`  - ${e}`));
      process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await Admin.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { name, email: email.toLowerCase().trim(), passwordHash },
      { upsert: true, new: true }
    );
    console.log(`Admin listo: ${email}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("seedAdmins falló:", err);
  process.exit(1);
});
