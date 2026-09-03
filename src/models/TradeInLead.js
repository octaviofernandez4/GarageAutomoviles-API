import mongoose from "mongoose";

const tradeInLeadSchema = new mongoose.Schema({
  modelo: { type: String, required: true },
  anio: { type: Number, required: true },
  km: { type: Number },
  telefono: { type: String, required: true },
  estado: { type: String, default: "Muy bueno" },
  historial: { type: String },
  neumaticos: { type: String },
  busca: { type: String },
  detalles: { type: String },
  vehiculoId: { type: String },
  vehiculoNombre: { type: String },
  createdAt: { type: Date, default: Date.now },
});

tradeInLeadSchema.index({ createdAt: -1 });

export default mongoose.model("TradeInLead", tradeInLeadSchema);
