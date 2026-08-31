import "dotenv/config";
import { connectDB } from "./db.js";
import Vehicle from "./models/Vehicle.js";
import mongoose from "mongoose";

const DEFAULT_CHECKS = [
  {
    title: "VIN y dominio auditados",
    description: "Verificación policial hecha, libre de deuda, prendas y multas al día de publicación.",
  },
  {
    title: "Historial de service",
    description: "Mantenimientos documentados en concesionario oficial hasta el último control.",
  },
  {
    title: "Peritaje de chapa y pintura",
    description: "Medición de espesor en los 12 paneles. Sin rastros de choque estructural.",
  },
  {
    title: "Test drive sin cargo",
    description: "Podés manejarla acompañada por un asesor antes de decidir.",
  },
];

const vehicles = [
  {
    id: "audi-q5",
    name: "Audi Q5 45 TFSI",
    brand: "Audi",
    body: "SUV",
    year: 2023,
    price: 55000,
    km: 42699,
    engine: "2.0 TFSI",
    gearbox: "S tronic",
    auto: true,
    fuel: "Nafta",
    traction: "Quattro",
    owners: 1,
    badge: "Recién ingresado",
    images: ["/vehicles/audi-q5.png"],
    checks: DEFAULT_CHECKS,
  },
  {
    id: "raptor",
    name: "Ford Ranger Raptor",
    brand: "Ford",
    body: "Pick-up",
    year: 2023,
    price: 42500,
    km: 15000,
    engine: "3.0 V6 EcoBoost",
    gearbox: "Aut. 10v",
    auto: true,
    fuel: "Nafta",
    traction: "4x4",
    owners: 1,
    badge: "Historial verificado",
    images: ["/vehicles/ranger-raptor.png"],
    checks: DEFAULT_CHECKS,
  },
  {
    id: "territory",
    name: "Ford Territory Titanium",
    brand: "Ford",
    body: "SUV",
    year: 2023,
    price: 31500,
    km: 22100,
    engine: "1.5 Turbo",
    gearbox: "CVT",
    auto: true,
    fuel: "Nafta",
    traction: "4x2",
    owners: 1,
    badge: "Service al día",
    images: ["/vehicles/territory.png"],
    checks: DEFAULT_CHECKS,
  },
  {
    id: "bmw-x1",
    name: "BMW X1 sDrive20i",
    brand: "BMW",
    body: "SUV",
    year: 2019,
    price: 29900,
    km: 68400,
    engine: "2.0 Turbo",
    gearbox: "Aut. 7v",
    auto: true,
    fuel: "Nafta",
    traction: "4x2",
    owners: 2,
    badge: "Historial verificado",
    images: ["/vehicles/bmw-x1.png"],
    checks: DEFAULT_CHECKS,
  },
  {
    id: "yaris",
    name: "Toyota Yaris XLS",
    brand: "Toyota",
    body: "Hatchback",
    year: 2022,
    price: 16900,
    km: 38900,
    engine: "1.5 16v",
    gearbox: "CVT",
    auto: true,
    fuel: "Nafta",
    traction: "4x2",
    owners: 1,
    badge: "Tomado en parte de pago",
    images: ["/vehicles/yaris.png"],
    checks: DEFAULT_CHECKS,
  },
  {
    id: "polo",
    name: "Volkswagen Polo Trendline",
    brand: "Volkswagen",
    body: "Hatchback",
    year: 2021,
    price: 14800,
    km: 54300,
    engine: "1.6 MSI",
    gearbox: "Manual 5v",
    auto: false,
    fuel: "Nafta",
    traction: "4x2",
    owners: 1,
    badge: "Service al día",
    images: ["/vehicles/polo.png"],
    checks: DEFAULT_CHECKS,
  },
];

async function seed() {
  await connectDB();
  await Vehicle.deleteMany({});
  await Vehicle.insertMany(vehicles);
  console.log(`Seeded ${vehicles.length} vehicles.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
