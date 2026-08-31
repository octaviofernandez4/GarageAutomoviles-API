import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    body: { type: String, required: true },
    year: { type: Number, required: true },
    price: { type: Number, required: true },
    km: { type: Number, required: true },
    engine: { type: String, required: true },
    gearbox: { type: String, required: true },
    auto: { type: Boolean, required: true },
    fuel: { type: String, required: true },
    traction: { type: String, required: true },
    owners: { type: Number, required: true },
    badge: { type: String, required: true },
    images: { type: [String], required: true, validate: (v) => v.length > 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Vehicle", vehicleSchema);
