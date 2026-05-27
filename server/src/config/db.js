import mongoose from "mongoose";

/**
 * Conecta a MongoDB. Si no hay URI o falla la conexión, el server sigue
 * funcionando en modo "sin persistencia" (útil para probar el chat rápido).
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("⚠️  MONGODB_URI no definida — corriendo sin persistencia.");
    return false;
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB conectado");
    return true;
  } catch (err) {
    console.error("❌ Error conectando a MongoDB:", err.message);
    console.warn("⚠️  Continuando sin persistencia.");
    return false;
  }
}

export function isDBConnected() {
  return mongoose.connection.readyState === 1;
}
