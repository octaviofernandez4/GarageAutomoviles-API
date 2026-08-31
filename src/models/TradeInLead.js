import mongoose from "mongoose";

const tradeInLeadSchema = new mongoose.Schema({
  modelo: { type: String, required: true },
  anio: { type: Number, required: true },
  km: { type: Number },
  telefono: { type: String, required: true },
  estado: { type: String, default: "Muy bueno" },
  busca: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("TradeInLead", tradeInLeadSchema);
