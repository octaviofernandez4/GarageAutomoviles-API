import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    body: { type: String, required: true },
    year: { type: Number, required: true },
    price: { type: Number, required: true },
    km: { type: Number },
    engine: { type: String },
    gearbox: { type: String },
    auto: { type: Boolean, default: true },
    fuel: { type: String },
    traction: { type: String },
    owners: { type: Number },
    badge: { type: String },
    description: { type: String, default: "" },
    images: { type: [String], default: [] },
    status: { type: String, enum: ["publicado", "borrador", "vendido"], default: "publicado" },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Vehicle", vehicleSchema);
