import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
  },
  { _id: false, timestamps: true }
);

const conversationSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Nueva conversación" },
    model: { type: String, default: "gemini" },
    messages: [messageSchema],
  },
  { timestamps: true }
);

// Genera un título a partir del primer mensaje del usuario.
conversationSchema.methods.deriveTitle = function () {
  const first = this.messages.find((m) => m.role === "user");
  if (first) {
    this.title = first.content.slice(0, 50) + (first.content.length > 50 ? "…" : "");
  }
};

export const Conversation = mongoose.model("Conversation", conversationSchema);
