import mongoose from "mongoose";

const chatLogSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  visitorName: { type: String },
  visitorPhone: { type: String },
  userMessage: { type: String, required: true },
  assistantReply: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

chatLogSchema.index({ sessionId: 1, createdAt: 1 });

export default mongoose.model("ChatLog", chatLogSchema);
